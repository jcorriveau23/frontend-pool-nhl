const Pool = require('../models/Pool');
const User = require('../models/User');
const Players = require('../models/Player');
const DayLeaders = require('../models/DayLeaders');

const util = require('./util');

const pool_creation = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.body.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const pool = await Pool.findOne({ name: req.body.name });

  if (pool) {
    res.json({
      success: false,
      message: 'pool name already taken!',
    });
  } else {
    let pool = new Pool({
      name: req.body.name,
      owner: user._id,
      number_poolers: req.body.number_pooler,
      number_forward: 9,
      number_defenders: 4,
      number_goalies: 2,
      number_reservist: 2,
      forward_pts_goals: 2,
      forward_pts_assists: 1,
      forward_pts_hattricks: 3,
      defender_pts_goals: 3,
      defender_pts_assists: 2,
      defender_pts_hattricks: 2,
      goalies_pts_wins: 2,
      goalies_pts_shutouts: 3,
      goalies_pts_goals: 3,
      goalies_pts_assists: 2,
      next_season_number_players_protected: 8,
      tradable_picks: 3,
      context: {},
      trades: [],
      nb_trade: 0,
      next_drafter: '',
      status: 'created',
    });

    await pool.save();

    res.json({
      success: true,
      message: pool.name,
    });
  }
};

const delete_pool = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const pool = await Pool.findOne({ name: req.body.name });

  if (pool.owner === user._id) {
    await Pool.deleteOne({ name: pool.name });
    res.json({
      success: true,
      message: 'pool has been deleted!',
    });
  } else {
    res.json({
      success: false,
      message: 'you are not the owner of that pool!',
    });
  }
};

const pool_list = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const poolCreated = await Pool.find({ status: 'created', owner: user._id });
  const pools = await Pool.find({ name: user.pool_list }, { name: 1, status: 1, owner: 1 });

  res.json({
    success: true,
    pool_created: poolCreated,
    user_pools_info: pools,
  });
};

const get_pool_info = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const pool = await Pool.findOne({ name: req.headers.poolname });

  if (!pool) {
    res.json({
      success: false,
      message: 'Pool does not exist',
    });
    return;
  } else {
    res.json({
      success: true,
      message: pool,
    });
    return;
  }
};

const start_draft = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const pool = await Pool.findOne({ name: req.body.pool_name });

  if (!pool) {
    res.json({
      success: false,
      message: 'The pool does not exist',
    });
    return;
  } else {
    const participants = req.body.participants;

    if (pool.number_poolers === participants.length) {
      if (pool.owner === user._id) {
        // modify pool object
        pool.context = {};
        for (i = 0; i < participants.length; i++) {
          pool.participants.push(participants[i]._id);
          pool.context[participants[i]._id] = {};
          (pool.context[participants[i]._id].chosen_defender = Array(pool.number_defenders).fill({
            id: i,
            name: ' - ',
            team: ' - ',
            position: 'D',
            url: '',
          })),
            (pool.context[participants[i]._id].chosen_forward = Array(pool.number_forward).fill({
              id: i,
              name: ' - ',
              team: ' - ',
              position: 'F',
              url: '',
            })),
            (pool.context[participants[i]._id].chosen_goalies = Array(pool.number_goalies).fill({
              id: i,
              name: ' - ',
              team: ' - ',
              position: 'G',
              url: '',
            })),
            (pool.context[participants[i]._id].chosen_reservist = Array(pool.number_reservist).fill({
              id: i,
              name: ' - ',
              team: ' - ',
              position: 'R',
              url: '',
            }));

          pool.context[participants[i]._id].tradable_picks = []; // array of tradable picks
          for (j = 0; j < pool.tradable_picks; j++) {
            pool.context[participants[i]._id].tradable_picks.push({
              rank: j + 1,
              player: participants[i]._id,
            });
          }

          pool.context[participants[i]._id].nb_defender = 0;
          pool.context[participants[i]._id].nb_forward = 0;
          pool.context[participants[i]._id].nb_goalies = 0;
          pool.context[participants[i]._id].nb_reservist = 0;
        }
        shuffleArray(pool.participants); // randomize a bit
        pool.context.draft_order = [];
        var number_picks =
          pool.number_poolers *
          (pool.number_defenders + pool.number_forward + pool.number_goalies + pool.number_reservist);
        for (i = 0; i < number_picks; i++) {
          pool.context.draft_order.push(pool.participants[i % pool.number_poolers]);
        }

        pool.next_drafter = pool.context.draft_order.shift(); // pop first next drafter of the draft

        pool.status = 'draft';
        pool.nb_player_drafted = 0;

        await Pool.updateOne({ _id: pool._id }, { $set: pool });

        for (i = 0; i < participants.length; i++) {
          const user = await User.findOne({ _id: participants[i]._id });
          user.pool_list.push(pool.name);

          await User.updateOne({ _id: user._id }, { $set: user });
          // console.log(user._id + ' assigned to pool: ' + pool.name);
        }
        res.json({
          success: true,
          message: pool,
        });
        return;
      } else {
        res.json({
          success: false,
          message: 'this request should be made by the owner of the pool',
        });
        return;
      }
    } else {
      res.json({
        success: false,
        message: 'Pool number of player does not correspond',
      });
      return;
    }
  }
};

const chose_player = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const player = req.body.player;
  let key_position = '';
  let key_nb_position = '';
  let max_number = 0;

  const pool = await Pool.findOne({ name: req.body.pool_name });

  if (!pool) {
    res.json({
      success: false,
      message: 'Pool does not exist',
    });
    return;
  } else {
    switch (player.position) {
      case 'D':
        key_position = 'chosen_defender';
        key_nb_position = 'nb_defender';
        max_number = pool.number_defenders;
        break;
      case 'F':
        key_position = 'chosen_forward';
        key_nb_position = 'nb_forward';
        max_number = pool.number_forward;
        break;
      case 'D':
        key_position = 'chosen_goalies';
        key_nb_position = 'nb_goalies';
        max_number = pool.number_goalies;
        break;
    }

    if (user._id === pool.next_drafter) {
      for (i = 0; i < pool.number_poolers; i++) {
        pooler = pool.participants[i];

        if (pool.context[pooler][key_position].findIndex(e => e.id === player.id) !== -1) {
          res.json({
            success: false,
            message: 'player already picked by ' + pooler,
          });
          return;
        }
        if (pool.context[pooler].chosen_reservist.findIndex(e => e.id === player.id) !== -1) {
          res.json({
            success: false,
            message: 'player already picked by ' + pooler,
          });
          return;
        }
      }
      var index;
      // player go in his position
      if (pool.context[user._id][key_nb_position] < max_number) {
        index = pool.context[user._id][key_nb_position];

        pool.context[user._id][key_position][index] = player;
        pool.context[user._id][key_nb_position] += 1;
      }
      //player go in reservist
      else if (pool.context[user._id].nb_reservist < pool.number_reservist) {
        index = pool.context[user._id].nb_reservist;

        pool.context[user._id].chosen_reservist[index] = player;
        pool.context[user._id].nb_reservist += 1;
      }
      // cant pick this player
      else {
        res.json({
          success: false,
          message: 'no space for this player',
        });
        return;
      }

      // next pooler to draft
      pool.nb_player_drafted += 1;
      pool.next_drafter = pool.context.draft_order.shift();
      if (
        pool.nb_player_drafted ===
        pool.number_poolers *
          (pool.number_defenders + pool.number_forward + pool.number_goalies + pool.number_reservist)
      ) {
        pool.status = 'in Progress'; // draft completed
      }

      await Pool.updateOne({ _id: pool._id }, { $set: pool });

      res.json({
        success: true,
        message: pool,
      });
      return;
    } else {
      res.json({
        success: false,
        message: 'not your turn',
      });
    }
  }
};

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

const get_pool_stats = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const playersID = [];

  const pool = await Pool.findOne({ name: req.headers.poolname });

  if (!pool) {
    res.json({
      success: false,
      message: 'Pool does not exist',
    });
    return;
  } else {
    for (let i = 0; i < pool.number_poolers; i++) {
      for (let j = 0; j < pool.context[pool.participants[i]].chosen_defender.length; j++) {
        playersID.push(pool.context[pool.participants[i]].chosen_defender[j].id);
      }
      for (let j = 0; j < pool.context[pool.participants[i]].chosen_forward.length; j++) {
        playersID.push(pool.context[pool.participants[i]].chosen_forward[j].id);
      }
      for (let j = 0; j < pool.context[pool.participants[i]].chosen_goalies.length; j++) {
        playersID.push(pool.context[pool.participants[i]].chosen_goalies[j].id);
      }
      for (let j = 0; j < pool.context[pool.participants[i]].chosen_reservist.length; j++) {
        playersID.push(pool.context[pool.participants[i]].chosen_reservist[j].id);
      }
    }

    const players = await Players.Players.find(
      { id: playersID },
      { id: 1, name: 1, team: 1, stats: 1, position: 1, url: 1 }
    );
    res.json({
      success: true,
      players: players,
    });
  }
};

const get_all_players = async (req, res, next) => {
  const [success, message, user] = await util.validate_user(req.headers.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  response = { F: [], D: [], G: [] };

  const forwards = await Players.DraftForwards.find();
  response['F'] = forwards;

  const defenders = await Players.DraftDefenders.find();
  response['D'] = defenders;

  const goalies = await Players.DraftGoalies.find();
  response['G'] = goalies;

  res.json({
    success: true,
    message: response,
  });
  return;
};

const get_day_leaders = async (req, res, next) => {
  const dayLeaders = await DayLeaders.findOne({ date: req.headers.d });

  if (!dayLeaders) {
    res.json({
      success: false,
      message: 'No day leaders for this day',
    });
    return;
  }
  res.json({
    success: true,
    message: dayLeaders,
  });
  return;
};

const cancel_trade = async (req, res, next) => {
  if (/*!req.body.tradeID ||*/ !req.body.name) {
    res.json({
      success: false,
      message: 'informations provided with the request are not valid',
    });
    return;
  }

  const [success, message, user] = await util.validate_user(req.body.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const pool = await Pool.findOne({ name: req.body.name });

  // validate that the trade ID provided exist

  if (pool.nb_trade < req.body.tradeID) {
    res.json({
      success: false,
      message: 'trade ID provided is not valid',
    });
    return;
  }

  // validate that the status of the trade is NEW

  if (pool.trades[req.body.tradeID].status !== 'NEW') {
    res.json({
      success: false,
      message: 'trade status must be NEW to be cancellable',
    });
    return;
  }

  // user needs to be the proposedBy of the tradeInfo

  if (pool.trades[req.body.tradeID].proposedBy != user._id) {
    res.json({
      success: false,
      message: 'Only the one that created the trade can cancel it',
    });
    return;
  }

  pool.trades[req.body.tradeID].status = 'CANCELLED';

  await Pool.updateOne({ _id: pool._id }, { $set: pool });

  res.json({
    success: true,
    message: pool,
  });
  return;
};

const respond_trade = async (req, res, next) => {
  console.log(req.body.isAccepted);
  console.log(typeof req.body.tradeID);
  if (/*!req.body.isAccepted || !req.body.tradeID ||*/ !req.body.name) {
    res.json({
      success: false,
      message: 'informations provided with the request are not valid',
    });
    return;
  }

  const [success, message, user] = await util.validate_user(req.body.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const pool = await Pool.findOne({ name: req.body.name });

  // validate that the trade ID provided exist

  if (pool.nb_trade < req.body.tradeID) {
    res.json({
      success: false,
      message: 'trade ID provided is not valid!',
    });
    return;
  }

  // validate that the status of the trade is NEW

  console.log(pool.trades[req.body.tradeID]);
  if (pool.trades[req.body.tradeID].status !== 'NEW') {
    res.json({
      success: false,
      message: 'trade status must be NEW to accept it!',
    });
    return;
  }

  // user needs to be the proposedBy of the tradeInfo

  if (pool.trades[req.body.tradeID].askTo != user._id) {
    res.json({
      success: false,
      message: 'Only the one that was ask for the trade can accept it!',
    });
    return;
  }

  // does the poolers really possess those players ?

  if (
    !validate_trade_possession(
      pool.trades[req.body.tradeID].fromItems,
      pool.context[pool.trades[req.body.tradeID].proposedBy]
    ) ||
    !validate_trade_possession(pool.trades[req.body.tradeID].toItems, pool.context[pool.trades[req.body.tradeID].askTo])
  ) {
    res.json({
      success: false,
      message: 'One of the to pooler does not possess the items list provided for the trade!',
    });
    return;
  }

  if (req.body.isAccepted) {
    pool.trades[req.body.tradeID].status = 'ACCEPTED';
    pool.trades[req.body.tradeID].dateAccepted = new Date();

    pool.context[pool.trades[req.body.tradeID].proposedBy] = remove_pooler_items(
      pool.trades[req.body.tradeID].fromItems,
      pool.context[pool.trades[req.body.tradeID].proposedBy]
    );

    pool.context[pool.trades[req.body.tradeID].askTo] = remove_pooler_items(
      pool.trades[req.body.tradeID].toItems,
      pool.context[pool.trades[req.body.tradeID].askTo]
    );
  } else {
    pool.trades[req.body.tradeID].status = 'REFUSED';
  }

  await Pool.updateOne({ _id: pool._id }, { $set: pool });

  res.json({
    success: true,
    message: pool,
  });
  return;
};

const create_trade = async (req, res, next) => {
  if (!req.body.tradeInfo || !req.body.name) {
    res.json({
      success: false,
      message: 'informations provided with the request are not valid',
    });
    return;
  }

  const [success, message, user] = await util.validate_user(req.body.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  // Make sure that user can only have 1 active trade at a time. return an error if already one trade active in this pool. (Active trade = NEW, ACCEPTED, )

  const pool = await Pool.findOne({ name: req.body.name });

  for (let i = 0; i < pool.trades.length; i++) {
    if (
      (pool.trades[i].status === 'NEW' || pool.trades[i].status === 'ACCEPTED') &&
      (pool.trades[i].proposedBy == user._id || pool.trades[i].askTo == user._id)
    ) {
      res.json({
        success: false,
        message: 'User can only have one active trade at a time',
      });
      return;
    }
  }

  // does the proposedBy and askTo field are valid

  if (
    !pool.participants.includes(req.body.tradeInfo.proposedBy) ||
    !pool.participants.includes(req.body.tradeInfo.askTo)
  ) {
    res.json({
      success: false,
      message: 'proposedBy and askTo fields are not pool participants',
    });
    return;
  }

  // does the the from or to side has too much items in the trade ?

  if (
    req.body.tradeInfo.fromItems.picks.length + req.body.tradeInfo.fromItems.players.length === 0 ||
    req.body.tradeInfo.toItems.picks.length + req.body.tradeInfo.toItems.players.length === 0
  ) {
    res.json({
      success: false,
      message: 'there is not items traded on one of the 2 sides',
    });
    return;
  }

  // does the the from or to side has too much items in the trade ?

  if (
    req.body.tradeInfo.fromItems.picks.length + req.body.tradeInfo.fromItems.players.length > 5 ||
    req.body.tradeInfo.toItems.picks.length + req.body.tradeInfo.toItems.players.length > 5
  ) {
    res.json({
      success: false,
      message: 'there is to much items in the trade',
    });
    return;
  }

  // does the poolers really possess those players ?

  if (
    !validate_trade_possession(req.body.tradeInfo.fromItems, pool.context[req.body.tradeInfo.proposedBy]) ||
    !validate_trade_possession(req.body.tradeInfo.toItems, pool.context[req.body.tradeInfo.askTo])
  ) {
    res.json({
      success: false,
      message: 'One of the to pooler does not poccess the items list provided for the trade!',
    });
    return;
  }

  // add the status == NEW to the tradeInfo and append it to the list pool.trades

  req.body.tradeInfo.status = 'NEW';
  req.body.tradeInfo.id = pool.nb_trade;
  pool.trades.push(req.body.tradeInfo);
  pool.nb_trade += 1;

  await Pool.updateOne({ _id: pool._id }, { $set: pool });

  res.json({
    success: true,
    message: pool,
  });
  return;
};

const fill_spot = async (req, res, next) => {
  if (!req.body.player || !req.body.name) {
    res.json({
      success: false,
      message: 'informations provided with the request are not valid',
    });
    return;
  }

  const [success, message, user] = await util.validate_user(req.body.token);

  if (!success) {
    res.json({
      success: false,
      message: message,
    });
    return;
  }

  const pool = await Pool.findOne({ name: req.body.name });

  // validate the chosen player is only in the reservist

  if (
    pool.context[user._id].chosen_forward.find(player => player.id === req.body.player.id) ||
    pool.context[user._id].chosen_defender.find(player => player.id === req.body.player.id) ||
    pool.context[user._id].chosen_goalies.find(player => player.id === req.body.player.id) ||
    !pool.context[user._id].chosen_reservist.find(player => player.id === req.body.player.id)
  ) {
    res.json({
      success: false,
      message: "The player should only be in the reservist pooler's list",
    });
    return;
  }

  // validate there is really a spot to fill in the user roster

  let isSpace = true;

  switch (req.body.player.position) {
    case 'D':
      if (pool.context[user._id].chosen_defender.length >= pool.number_defenders) isSpace = false;
      break;
    case 'F':
      if (pool.context[user._id].chosen_forward.length >= pool.number_forward) isSpace = false;
      break;
    case 'G':
      if (pool.context[user._id].chosen_goalies.length >= pool.number_goalies) isSpace = false;
      break;
  }

  if (!isSpace) {
    res.json({
      success: false,
      message: 'There is no spot to fill to add this player in your roster.',
    });
    return;
  }

  // add this player in the spot to fill.

  const index = pool.context[user._id].chosen_reservist.findIndex(player => player.id === req.body.player.id);
  if (index > -1) {
    const player = pool.context[user._id].chosen_reservist[index];
    pool.context[user._id].chosen_reservist.splice(index, 1);

    switch (player.position) {
      case 'D':
        pool.context[user._id].chosen_defender.push(player);
        break;
      case 'F':
        pool.context[user._id].chosen_forward.push(player);
        break;
      case 'G':
        pool.context[user._id].chosen_goalies.push(player);
        break;
    }
  }

  await Pool.updateOne({ _id: pool._id }, { $set: pool });

  res.json({
    success: true,
    message: pool,
  });
  return;
};

const remove_pooler_items = (tradingList, playerContext) => {
  let index = -1;

  for (let i = 0; i < tradingList.players.length; i += 1) {
    switch (tradingList.players[i].position) {
      case 'D':
        index = playerContext.chosen_defender.findIndex(player => player.id === tradingList.players[i].id);
        if (index > -1) {
          playerContext.chosen_defender.splice(index, 1);
          continue;
        }
        break;

      case 'F':
        index = playerContext.chosen_forward.findIndex(player => player.id === tradingList.players[i].id);
        if (index > -1) {
          playerContext.chosen_forward.splice(index, 1);
          continue;
        }
        break;

      case 'G':
        index = playerContext.chosen_goalies.findIndex(player => player.id === tradingList.players[i].id);
        if (index > -1) {
          playerContext.chosen_goalies.splice(index, 1);
          continue;
        }
        break;
    }

    index = playerContext.chosen_reservist.findIndex(player => player.id === tradingList.players[i].id);
    if (index > -1) {
      playerContext.chosen_reservist.splice(index, 1);
    }
  }

  for (let i = 0; i < tradingList.picks.length; i += 1) {
    index = playerContext.tradable_picks.findIndex(
      pick => pick.rank === tradingList.picks[i].rank && pick.player === tradingList.picks[i].player
    );
    if (index > -1) {
      playerContext.tradable_picks.splice(index, 1);
    }
  }

  return playerContext;
};

const add_poolers_items = (tradingList, playerContext) => {};

const validate_trade_possession = (tradingList, playerContext) => {
  for (let i = 0; i < tradingList.players.length; i += 1) {
    switch (tradingList.players[i].position) {
      case 'D':
        if (
          !playerContext.chosen_defender.find(player => player.id === tradingList.players[i].id) &&
          !playerContext.chosen_reservist.find(player => player.id === tradingList.players[i].id)
        ) {
          return false;
        }
        break;

      case 'F':
        if (
          !playerContext.chosen_forward.find(player => player.id === tradingList.players[i].id) &&
          !playerContext.chosen_reservist.find(player => player.id === tradingList.players[i].id)
        ) {
          return false;
        }
        break;

      case 'G':
        if (
          !playerContext.chosen_goalies.find(player => player.id === tradingList.players[i].id) &&
          !playerContext.chosen_reservist.find(player => player.id === tradingList.players[i].id)
        ) {
          return false;
        }
        break;
    }
  }

  for (let i = 0; i < tradingList.picks.length; i += 1) {
    if (
      !playerContext.tradable_picks.find(
        pick => pick.rank === tradingList.picks[i].rank && pick.player === tradingList.picks[i].player
      )
    ) {
      return false;
    }
  }

  return true;
};

const shuffleArray = arr => {
  arr.sort(() => Math.random() - 0.5);
};

module.exports = {
  pool_creation,
  pool_list,
  get_pool_info,
  start_draft,
  chose_player,
  protected_players,
  get_pool_stats,
  delete_pool,
  get_all_players,
  get_day_leaders,
  create_trade,
  cancel_trade,
  respond_trade,
  fill_spot,
};
