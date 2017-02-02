'use strict'

const express = require('express')
let router = express.Router()
const jwt = require('jsonwebtoken')
const mongoose = require('../utils/connection')
const _ = require('lodash')

// SYSTEM MIDDLEWARES
const JWTAuth = (req, res, next) => {
  const authorizationToken = req.headers['authorization']
  if (authorizationToken) {
    let tokens = authorizationToken.split(' ')
    jwt.verify(tokens[1], require('../../keys').SECRET, (err, decoded) => {
      if (err || tokens[0] !== 'Bearer') {
        let message = 'Failed to authenticate token.'
        if (err.name === 'TokenExpiredError') {
          message = 'Token has expired, please login again.'
        }
        res.status(403).send({ success: false, message: message })
        next()
      } else {
        req.decoded = decoded._doc
        global.appState.user = req.decoded
        next()
      }
    })
  } else {
    res.status(403).send({
      success: false,
      message: 'No token provided.'
    })
    next()
  }
}

const mongooseConnect = (req, res, next) => {
  console.log('Connecting...')
  mongoose.connect(next)
}

const mongooseDisconnect = (req, res) => {
  console.log('Disconnecting...')
  mongoose.disconnect()
}

const cleanAppState = (req, res, next) => {
  global.appState = {}
  next()
}

router.get('/', (req, res) => res.json({ message: 'Welcome to our api!' }))

router.use(mongooseConnect)

// CUSTOM ROUTES
router = require('./user.js')(router, JWTAuth)
router = require('./populate.js')(router, JWTAuth)
router = require('./avaliacao.js')(router, JWTAuth)


// DEFAULT ROUTES
const Models = require('require-dir')('../models/default')
Object.keys(Models).forEach(modelKey => {
  let Model = Models[modelKey]
  let modelName = Model.modelName
  let instanceName = modelName.toLowerCase()
  let modelAttributes = Object.keys(Model.schema.paths).filter(key => key !== '__v' && key !== '_id')

  router.route('/' + instanceName)
    .post(JWTAuth, (req, res, next) => {
      let instance = new Model()
      modelAttributes.forEach((key) => {
        _.set(instance, key, req.body[key] ? req.body[key] : instance[key])
      })
      return instance.save()
        .then(response => {
          res.json({ message: modelName + ' was created successfully' })
          next()
        })
        .catch(error => {
          res.status(error.statusCode || 403).send(error.message)
          next()
        })
    })
    .get(JWTAuth, (req, res, next) => {
      return Model.find()
        .then(response => {
          res.json(response)
          next()
        })
        .catch(error => {
          res.status(error.statusCode || 500).send(error.message)
          next()
        })
    })

  router.route('/' + instanceName + '/:id')
    .get(JWTAuth, (req, res, next) => {
      return Model.findById(req.params.id)
        .then(response => {
          res.json(response)
          next()
        })
        .catch(error => {
          res.status(error.statusCode || 500).send(error.message)
          next()
        })
    })
    .put(JWTAuth, (req, res, next) => {
      return Model.findById(req.params.id)
        .then(response => {
          console.log(response)
          Object.keys(req.body)
            .filter(attribute => modelAttributes.indexOf(attribute) !== -1)
            .forEach(attribute => {
              _.set(response, attribute, req.body[attribute])
            })
          return response.save()
        })
        .then(response => {
          res.json(response)
          next()
        })
        .catch(error => {
          console.log(error)
          res.status(error.statusCode || 403).send(error.message)
          next()
        })
    })
    .delete(JWTAuth, (req, res, next) => {
      return Model.remove({ _id: req.params.id })
        .then(response => {
          res.json({ message: modelName + ' successfully deleted' })
          next()
        })
        .catch(error => {
          res.status(error.statusCode || 403).send(error.message)
          next()
        })
    })
})

router.use(cleanAppState)
router.use(mongooseDisconnect)

module.exports = router
