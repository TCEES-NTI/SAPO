'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const splitArray = require('../../utils/split-array')
const CONSTS = require('../../utils/constants')

let PilarSchema = new Schema({
  indicadorId: {
    type: Schema.ObjectId,
    ref: 'Entidade'
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

module.exports = mongoose.model('Pilar', PilarSchema)
