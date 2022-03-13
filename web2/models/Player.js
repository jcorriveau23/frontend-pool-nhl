const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new Schema(
  {
    name: { type: String },
    team: { type: String },
    stats: { type: Object },
    url: { type: String },
    position: { type: String },
  },
  { timestamps: true }
);

const Players = mongoose.model("players", playerSchema);
const DraftDefenders = mongoose.model("draft_defenders", playerSchema);
const DraftForwards = mongoose.model("draft_forwards", playerSchema);
const DraftGoalies = mongoose.model("draft_goalies", playerSchema);

module.exports = {
  Players,
  DraftDefenders,
  DraftForwards,
  DraftGoalies,
};
