const Pool = require('../models/Pool');

const util = require('./util');

const protected_players = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const def_protected = req.body.def_protected;
  const forw_protected = req.body.forw_protected;
  const goal_protected = req.body.goal_protected;
  const reserv_protected = req.body.reserv_protected;

  const pool = await Pool.findOne({ name: req.body.pool_name });

  if (!pool) {
    res.json({
      success: false,
      message: 'Pool does not exist',
    });
    return;
  } else {
    if (def_protected.length <= pool.number_defenders) {
      pool.context[user._id].chosen_defender = def_protected;
      pool.context[user._id].nb_defender = def_protected.length;
    } else {
      res.json({
        success: false,
        message: 'too much defenders',
      });
      return;
    }
    if (forw_protected.length <= pool.number_forward) {
      pool.context[user._id].chosen_forward = forw_protected;
      pool.context[user._id].nb_forward = forw_protected.length;
    } else {
      res.json({
        success: false,
        message: 'too much forward',
      });
      return;
    }

    if (goal_protected.length <= pool.number_goalies) {
      pool.context[user._id].chosen_goalies = goal_protected;
      pool.context[user._id].nb_goalies = goal_protected.length;
    } else {
      res.json({
        success: false,
        message: 'too much goalies',
      });
      return;
    }
    if (reserv_protected.length <= pool.number_reservist) {
      pool.context[user._id].chosen_reservist = reserv_protected;
      pool.context[user._id].nb_reservist = reserv_protected.length;
    } else {
      res.json({
        success: false,
        message: 'too much reservist',
      });
      return;
    }
    var ready = true;

    for (i = 0; i < pool.number_poolers; i++) {
      pooler = pool.participants[i];

      nb_protected =
        pool.context[pooler].nb_defender +
        pool.context[pooler].nb_forward +
        pool.context[pooler].nb_goalies +
        pool.context[pooler].nb_reservist;
      if (nb_protected > pool.next_season_number_players_protected) {
        ready = false; // At least one player is not ready
        break;
      }
    }
    if (ready) {
      pool.context.draft_order = [];

      for (rank = 1; rank <= pool.tradable_picks; rank++) {
        for (j = pool.number_poolers - 1; j > -1; j--) {
          //i picks of player j
          var player_search = pool.participants[j]; // participants should be reordered depending on the rank of last season

          if (
            pool.context[player_search].tradable_picks.findIndex(t => t.rank === rank && t.player === player_search) >
            -1
          ) {
            // player still has his picks
            console.log('rank:' + rank + 'from ' + player_search + ' got the pick: ' + player_search);
            pool.context.draft_order.push(player_search);
          } else {
            // player traded his picks to another pooler lets find who has it
            for (i = 0; i < pool.number_poolers; i++) {
              pooler = pool.final_rank[i];
              if (
                pool.context[pooler].tradable_picks.findIndex(t => t.rank === rank && t.player === player_search) > -1
              ) {
                pool.context.draft_order.push(pooler);
                break;
              }
            }
          }
        }
      }
      var number_picks =
        pool.number_poolers *
        (pool.number_defenders +
          pool.number_forward +
          pool.number_goalies +
          pool.number_reservist -
          pool.next_season_number_players_protected);
      for (i = number_picks - (pool.tradable_picks * pool.number_poolers + 1); i > -1; i--) {
        pool.context.draft_order.push(pool.participants[i % pool.number_poolers]);
      }
      pool.status = 'draft';
      pool.nb_player_drafted = pool.next_season_number_players_protected * pool.number_poolers;
      pool.next_drafter = pool.context.draft_order.shift();

      // reset tradable picks
      for (i = 0; i < pool.number_poolers; i++) {
        pool.context[pool.participants[i]].tradable_picks = []; // reset array of tradable picks
        for (j = 0; j < pool.tradable_picks; j++) {
          pool.context[pool.participants[i]].tradable_picks.push({
            rank: j + 1,
            player: pool.participants[i],
          });
        }
      }
    }

    await Pool.updateOne({ _id: pool._id }, { $set: pool });

    res.json({
      success: true,
      message: pool,
    });
    return;
  }
};

module.exports = {
  protected_players,
};
