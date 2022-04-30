const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DayLeaderSchema = new Schema(
  {
    date: { type: String },
    skaters: [Object],
    goalies: [Object],
  },
  { timestamps: true }
);

const DayLeaders = mongoose.model('day_leaders', DayLeaderSchema);

module.exports = DayLeaders;
