'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const splitArray = require('../../utils/split-array')
const CONSTS = require('../../utils/constants')

let TipoSchema = new Schema({
  pilarId: {
    type: Schema.ObjectId,
    ref: 'Pilar'
  },
  nome: {
    type: String
  },
  descricao: {
    type: String
  },
  bkpData: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('Tipo', TipoSchema)
