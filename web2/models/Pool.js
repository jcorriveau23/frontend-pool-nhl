const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const poolSchema = new Schema(
  {
    name: { type: String },
    owner: { type: String },
    number_poolers: { type: Number },
    number_forward: { type: Number },
    number_defenders: { type: Number },
    number_goalies: { type: Number },
    number_reservist: { type: Number },

    forward_pts_goals: { type: Number },
    forward_pts_assists: { type: Number },
    forward_pts_hattricks: { type: Number },
    defender_pts_goals: { type: Number },
    defender_pts_assists: { type: Number },
    defender_pts_hattricks: { type: Number },
    goalies_pts_wins: { type: Number },
    goalies_pts_shutouts: { type: Number },
    goalies_pts_goals: { type: Number },
    goalies_pts_assists: { type: Number },
    next_season_number_players_protected: { type: Number },
    tradable_picks: { type: Number },

    participants: [String],
    next_drafter: { type: String },

    context: { type: Object },
    nb_player_drafted: { type: Number },

    status: { type: String },
    final_rank: [String],
  },
  { timestamps: true }
);

const Pool = mongoose.model("Pool", poolSchema);
module.exports = Pool;
