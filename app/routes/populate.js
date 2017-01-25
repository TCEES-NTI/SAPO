'use strict'

const Item = require('../models/default/item')
const SubNivel = require('../models/default/subnivel')
let modelAttributes = Object.keys(Item.schema.paths).filter(key => key !== '__v' && key !== '_id')
const config = require('../../keys')
const cache = require('../utils/cache')
const URL = '/populate'

module.exports = (router, JWTAuth) => {
  router.route(URL + '/item/:id')
    .get(JWTAuth, (req, res, next) => {
      return Item.findById(req.params.id)
        .populate({
          path: 'subnivel',
          model: 'Subnivel',
          populate: {
            path: 'nivel',
            model: 'Nivel',
            populate: {
              path: 'tipo',
              model: 'Tipo',
              populate: {
                path: 'pilar',
                model: 'Pilar',
                populate: {
                  path: 'indicador',
                  model: 'Indicador'
                }
              }
            }
          }
        })
        .then(response => {
          res.json(response)
          next()
        })
        .catch(error => {
          res.status(error.statusCode || 500).send(error.message)
          next()
        })
    })
  router.route(URL + '/item')
    .get(JWTAuth, cache(6 * 60 * 60), (req, res, next) => {
      if (req.responseReady) {
        res.send(req.responseReady)
        next()
      } else {
        return Item.find()
        .populate({
          path: 'subnivel',
          model: 'Subnivel',
          populate: {
            path: 'nivel',
            model: 'Nivel',
            populate: {
              path: 'tipo',
              model: 'Tipo',
              populate: {
                path: 'pilar',
                model: 'Pilar',
                populate: {
                  path: 'indicador',
                  model: 'Indicador'
                }
              }
            }
          }
        })
        .then(response => {
          res.json(response)
          next()
        })
        .catch(error => {
          console.log('TIVE ERRO?!', error.message)
          res.status(error.statusCode || 500).send(error.message)
          next()
        })
      }
      
    })

  return router
}