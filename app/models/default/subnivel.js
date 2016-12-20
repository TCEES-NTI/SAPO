'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const splitArray = require('../../utils/split-array')
const CONSTS = require('../../utils/constants')

let SubnivelSchema = new Schema({
  nivelId: {
    type: Schema.ObjectId,
    ref: 'Nivel'
  },
  nome: {
    type: String
  },
  descricao: {
    type: String
  },
  idHistorico: {
    type: Number
  }
})

module.exports = mongoose.model('Subnivel', SubnivelSchema)
