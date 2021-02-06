const mongoose = require('mongoose')
const Schema = mongoose.Schema

const poolSchema = new Schema({
  name: {type: String},
  owner: {type: String},
  number_poolers: {type: Number},
  number_forward: {type: Number},
  number_defenders: {type: Number},
  number_goalies: {type: Number},
  number_reservist: {type: Number},

  forward_pts_goals: {type: Number},
  forward_pts_assists: {type: Number},
  forward_pts_hattricks: {type: Number},
  defender_pts_goals: {type: Number},
  defender_pts_assits: {type: Number},
  defender_pts_hattricks: {type: Number},
  goalies_pts_wins: {type: Number},
  goalies_pts_shutouts: {type: Number},
  goalies_pts_goals: {type: Number},
  goalies_pts_assists: {type: Number},

  participants: [String],

  context: {
      participants: [{
          user: {type: String},
          choice_forward: [{name: {type: String}, api_call: {type: String}}],
          choice_defender: [{name: {type: String}, api_call: {type: String}}],
          choice_goalies: [{name: {type: String}, api_call: {type: String}}]
      }]
  },

  status: {type: String}

}, {timestamps: true})


const Pool = mongoose.model('Pool', poolSchema)
module.exports = Pool

