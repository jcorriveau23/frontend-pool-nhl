const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playerSchema = new Schema({
  name: {type: String},
  team: {type: String},
  stats: {type: Object},
  url: {type: String},
  position: {type: String}

}, {timestamps: true})


const Player = mongoose.model('Player', playerSchema)
module.exports = Player

