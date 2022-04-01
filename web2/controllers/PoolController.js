const Pool = require("../models/Pool");
const User = require("../models/User");
const Players = require("../models/Player");
const DayLeaders = require("../models/DayLeaders");

//import { PRIVATE_KEY_DB } from 'constants'
PRIVATE_KEY_DB = "verySecretValue";

const jwt = require("jsonwebtoken");

const pool_creation = (req, res, next) => {
  var encrypt_token = req.body.token;
  console.log(req.body);

  let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);
  // TODO: use token.iat and token.exp to use token expiration and force user to re-login
  User.findOne({ _id: token._id }).then((user) => {
    if (!user) {
      res.json({
        success: "False",
        message: "User is not registered!",
      });
    }
  });

  Pool.findOne({ name: req.body.name }).then((pool) => {
    if (pool) {
      res.json({
        success: "False",
        message: "pool name already taken!",
      });
    } else {
      let pool = new Pool({
        name: req.body.name,
        owner: token._id,
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
        next_drafter: "",
        status: "created",
      });

      pool
        .save()
        .then((pool) => {
          res.json({
            success: "True",
            message: pool.name,
          });
        })
        .catch((error) => {
          res.json({
            success: "False",
            message: error,
          });
        });
    }
  });
};

const delete_pool = (req, res, next) => {
  var encrypt_token = req.body.token;

  let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);
  // TODO: use token.iat and token.exp to use token expiration and force user to re-login
  User.findOne({ _id: token._id }).then((user) => {
    if (!user) {
      res.json({
        success: "False",
        message: "User is not registered!",
      });
    }
  });

  Pool.findOne({ name: req.body.name }).then((pool) => {
    if (pool.owner === token._id) {
      Pool.deleteOne({ name: pool.name }).then((pool) => {
        res.json({
          success: "True",
          message: "pool as been deleted!",
        });
      });
    } else {
      res.json({
        success: "False",
        message: "you are not the owner of that pool!",
      });
    }
  });
};

const pool_list = (req, res, next) => {
  var user_pools = [];

  if (req.headers.token !== "undefined") {
    var encrypt_token = req.headers.token;
    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ _id: token._id }).then((user) => {
      if (!user) {
        res.json({
          success: "False",
          message: "User is not registered!",
        });
        return;
      }

      user_pools = user.pool_list;

      Pool.find({ status: "created", owner: user._id })
        .then((pools_created) => {
          Pool.find({ name: user.pool_list }, { name: 1, status: 1, owner: 1 })
            .then((pools) => {
              res.json({
                success: "True",
                pool_created: pools_created,
                user_pools_info: pools,
              });
            })
            .catch((error) => {
              res.json({
                success: "False",
                message: error,
              });
            });
        })
        .catch((error) => {
          res.json({
            success: "False",
            message: error,
          });
        });
    });
  } else {
    res.json({
      success: "False",
      message: "no token, you need to login",
    });
  }
};

const get_pool_info = (req, res, next) => {
  if (req.headers.token !== "undefined") {
    var encrypt_token = req.headers.token;
    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ _id: token._id }).then((user) => {
      if (!user) {
        res.json({
          success: "False",
          message: "User is not registered!",
        });
        return;
      }
    });
  } else {
    res.json({
      success: "False",
      message: "no token, you need to login",
    });
    return;
  }

  var pool_name = req.headers.poolname;

  Pool.findOne({ name: pool_name })
    .then((pool) => {
      if (!pool) {
        res.json({
          success: "False",
          message: "Pool does not exist",
        });
        return;
      } else {
        res.json({
          success: "True",
          message: pool,
        });
        return;
      }
    })
    .catch((error) => {
      res.json({
        success: "False",
        message: error,
      });
      return;
    });
};

const start_draft = (req, res, next) => {
  if (req.body.token !== "undefined") {
    var encrypt_token = req.body.token;
    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);
    user_id = token._id;
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ _id: token._id }).then((user) => {
      if (!user) {
        res.json({
          success: "False",
          message: "User is not registered!",
        });
        return;
      }
    });
  } else {
    res.json({
      success: "False",
      message: "no token, you need to login",
    });
    return;
  }

  var pool_name = req.body.pool_name;
  participants = req.body.participants;

  Pool.findOne({ name: pool_name })
    .then((pool) => {
      if (!pool) {
        res.json({
          success: "False",
          message: "Pool does not exist",
        });
        return;
      } else {
        if (pool.number_poolers === participants.length) {
          if (pool.owner === user_id) {
            // modify pool object
            pool.context = {};
            for (i = 0; i < participants.length; i++) {
              pool.participants.push(participants[i]._id);
              pool.context[participants[i]._id] = {};
              (pool.context[participants[i]._id].chosen_defender = Array(
                pool.number_defenders
              ).fill({
                id: i,
                name: " - ",
                team: " - ",
                position: "D",
                url: "",
              })),
                (pool.context[participants[i]._id].chosen_forward = Array(
                  pool.number_forward
                ).fill({
                  id: i,
                  name: " - ",
                  team: " - ",
                  position: "F",
                  url: "",
                })),
                (pool.context[participants[i]._id].chosen_goalies = Array(
                  pool.number_goalies
                ).fill({
                  id: i,
                  name: " - ",
                  team: " - ",
                  position: "G",
                  url: "",
                })),
                (pool.context[participants[i]._id].chosen_reservist = Array(
                  pool.number_reservist
                ).fill({
                  id: i,
                  name: " - ",
                  team: " - ",
                  position: "R",
                  url: "",
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
              (pool.number_defenders +
                pool.number_forward +
                pool.number_goalies +
                pool.number_reservist);
            for (i = 0; i < number_picks; i++) {
              pool.context.draft_order.push(
                pool.participants[i % pool.number_poolers]
              );
            }

            pool.next_drafter = pool.context.draft_order.shift(); // pop first next drafter of the draft

            pool.status = "draft";
            pool.nb_player_drafted = 0;

            Pool.updateOne(
              { _id: pool._id },
              { $set: pool },
              function (err, result) {
                if (err) {
                  res.json({
                    success: "False",
                    message: "Problem with updating the pool information",
                  });
                  return;
                } else {
                  for (i = 0; i < participants.length; i++) {
                    User.findOne({ _id: participants[i]._id })
                      .then((user) => {
                        user.pool_list.push(pool.name);

                        User.updateOne(
                          { _id: user._id },
                          { $set: user },
                          function (err, result) {
                            if (err) {
                              res.json({
                                success: "False",
                                message:
                                  "Problem with updating one of user information",
                              });
                              return;
                            } else {
                              console.log(
                                user._id + " assigned to pool: " + pool.name
                              );
                            }
                          }
                        );
                      })
                      .catch((error) => {
                        res.json({
                          success: "False",
                          message: error,
                        });
                        return;
                      });
                  }
                  res.json({
                    success: "True",
                    message: pool,
                  });
                  return;
                }
              }
            );
          } else {
            res.json({
              success: "False",
              message: "this request should be made by the owner of the pool",
            });
            return;
          }
        } else {
          res.json({
            success: "False",
            message: "Pool number of player does not correspond",
          });
          return;
        }
      }
    })
    .catch((error) => {
      res.json({
        success: "False",
        message: error,
      });
      return;
    });
};

const chose_player = (req, res, next) => {
  var user_id;

  if (req.body.token !== "undefined") {
    var encrypt_token = req.body.token;
    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);
    user_id = token._id;
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ _id: token._id }).then((user) => {
      if (!user) {
        res.json({
          success: "False",
          message: "User is not registered!",
        });
        return;
      }
    });
  } else {
    res.json({
      success: "False",
      message: "no token, you need to login",
    });
    return;
  }

  var pool_name = req.body.pool_name;
  var player = req.body.player;
  var key_position = "";
  var key_nb_position = "";
  var max_number = 0;

  Pool.findOne({ name: pool_name }).then((pool) => {
    if (!pool) {
      res.json({
        success: "False",
        message: "Pool does not exist",
      });
      return;
    } else {
      if (player.position === "D") {
        key_position = "chosen_defender";
        key_nb_position = "nb_defender";
        max_number = pool.number_defenders;
      } else if (player.position === "F") {
        key_position = "chosen_forward";
        key_nb_position = "nb_forward";
        max_number = pool.number_forward;
      } else if (player.position === "G") {
        key_position = "chosen_goalies";
        key_nb_position = "nb_goalies";
        max_number = pool.number_goalies;
      }

      if (user_id === pool.next_drafter) {
        for (i = 0; i < pool.number_poolers; i++) {
          pooler = pool.participants[i];

          if (
            pool.context[pooler][key_position].findIndex(
              (e) => e.id === player.id
            ) !== -1
          ) {
            res.json({
              success: "False",
              message: "player already picked by " + pooler,
            });
            return;
          }
          if (
            pool.context[pooler]["chosen_reservist"].findIndex(
              (e) => e.id === player.id
            ) !== -1
          ) {
            res.json({
              success: "False",
              message: "player already picked by " + pooler,
            });
            return;
          }
        }
        var index;
        // player go in his position
        if (pool.context[user_id][key_nb_position] < max_number) {
          index = pool.context[user_id][key_nb_position];

          pool.context[user_id][key_position][index] = player;
          pool.context[user_id][key_nb_position] += 1;
        }
        //player go in reservist
        else if (pool.context[user_id].nb_reservist < pool.number_reservist) {
          index = pool.context[user_id].nb_reservist;

          pool.context[user_id].chosen_reservist[index] = player;
          pool.context[user_id].nb_reservist += 1;
        }
        // cant pick this player
        else {
          res.json({
            success: "False",
            message: "no space for this player",
          });
          return;
        }

        // next pooler to draft
        pool.nb_player_drafted += 1;
        pool.next_drafter = pool.context.draft_order.shift();
        if (
          pool.nb_player_drafted ===
          pool.number_poolers *
            (pool.number_defenders +
              pool.number_forward +
              pool.number_goalies +
              pool.number_reservist)
        ) {
          pool.status = "in Progress"; // draft completed
        }

        Pool.updateOne(
          { _id: pool._id },
          { $set: pool },
          function (err, result) {
            if (err) {
              res.json({
                success: "False",
                message: "Problem with updating the pool information",
              });
              return;
            } else {
              res.json({
                success: "True",
                message: pool,
              });
              return;
            }
          }
        );
      } else {
        res.json({
          success: "False",
          message: "not your turn",
        });
      }
    }
  });
};

const protected_players = (req, res, next) => {
  var user_id;

  if (req.body.token !== "undefined") {
    var encrypt_token = req.body.token;
    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);
    user_id = token._id;
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ _id: token._id }).then((user) => {
      if (!user) {
        res.json({
          success: "False",
          message: "User is not registered!",
        });
        return;
      }
    });
  } else {
    res.json({
      success: "False",
      message: "no token, you need to login",
    });
    return;
  }

  var pool_name = req.body.pool_name;
  var def_protected = req.body.def_protected;
  var forw_protected = req.body.forw_protected;
  var goal_protected = req.body.goal_protected;
  var reserv_protected = req.body.reserv_protected;

  Pool.findOne({ name: pool_name }).then((pool) => {
    if (!pool) {
      res.json({
        success: "False",
        message: "Pool does not exist",
      });
      return;
    } else {
      if (def_protected.length <= pool.number_defenders) {
        pool.context[user_id].chosen_defender = def_protected;
        pool.context[user_id].nb_defender = def_protected.length;
      } else {
        res.json({
          success: "False",
          message: "too much defenders",
        });
        return;
      }
      if (forw_protected.length <= pool.number_forward) {
        pool.context[user_id].chosen_forward = forw_protected;
        pool.context[user_id].nb_forward = forw_protected.length;
      } else {
        res.json({
          success: "False",
          message: "too much forward",
        });
        return;
      }

      if (goal_protected.length <= pool.number_goalies) {
        pool.context[user_id].chosen_goalies = goal_protected;
        pool.context[user_id].nb_goalies = goal_protected.length;
      } else {
        res.json({
          success: "False",
          message: "too much goalies",
        });
        return;
      }
      if (reserv_protected.length <= pool.number_reservist) {
        pool.context[user_id].chosen_reservist = reserv_protected;
        pool.context[user_id].nb_reservist = reserv_protected.length;
      } else {
        res.json({
          success: "False",
          message: "too much reservist",
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
              pool.context[player_search].tradable_picks.findIndex(
                (t) => t.rank === rank && t.player === player_search
              ) > -1
            ) {
              // player still has his picks
              console.log(
                "rank:" +
                  rank +
                  "from " +
                  player_search +
                  " got the pick: " +
                  player_search
              );
              pool.context.draft_order.push(player_search);
            } else {
              // player traded his picks to another pooler lets find who has it
              for (i = 0; i < pool.number_poolers; i++) {
                pooler = pool.final_rank[i];
                if (
                  pool.context[pooler].tradable_picks.findIndex(
                    (t) => t.rank === rank && t.player === player_search
                  ) > -1
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
        for (
          i = number_picks - (pool.tradable_picks * pool.number_poolers + 1);
          i > -1;
          i--
        ) {
          pool.context.draft_order.push(
            pool.participants[i % pool.number_poolers]
          );
        }
        pool.status = "draft";
        pool.nb_player_drafted =
          pool.next_season_number_players_protected * pool.number_poolers;
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

      Pool.updateOne({ _id: pool._id }, { $set: pool }, function (err, result) {
        if (err) {
          res.json({
            success: "False",
            message: "Problem with updating the pool information",
          });
          return;
        } else {
          res.json({
            success: "True",
            message: pool,
          });
          return;
        }
      });
    }
  });
};

const get_pool_stats = (req, res, next) => {
  if (req.headers.token !== "undefined") {
    var encrypt_token = req.headers.token;
    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);
    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ _id: token._id }).then((user) => {
      if (!user) {
        res.json({
          success: "False",
          message: "User is not registered!",
        });
        return;
      }
    });
  } else {
    res.json({
      success: "False",
      message: "no token, you need to login",
    });
    return;
  }

  var pool_name = req.headers.poolname;
  var players_id = [];

  Pool.findOne({ name: pool_name }).then((pool) => {
    if (!pool) {
      res.json({
        success: "False",
        message: "Pool does not exist",
      });
      return;
    } else {
      for (var i = 0; i < pool.number_poolers; i++) {
        for (
          var j = 0;
          j < pool.context[pool.participants[i]].chosen_defender.length;
          j++
        ) {
          players_id.push(
            pool.context[pool.participants[i]].chosen_defender[j].id
          );
        }
        for (
          var j = 0;
          j < pool.context[pool.participants[i]].chosen_forward.length;
          j++
        ) {
          players_id.push(
            pool.context[pool.participants[i]].chosen_forward[j].id
          );
        }
        for (
          var j = 0;
          j < pool.context[pool.participants[i]].chosen_goalies.length;
          j++
        ) {
          players_id.push(
            pool.context[pool.participants[i]].chosen_goalies[j].id
          );
        }
        for (
          var j = 0;
          j < pool.context[pool.participants[i]].chosen_reservist.length;
          j++
        ) {
          players_id.push(
            pool.context[pool.participants[i]].chosen_reservist[j].id
          );
        }
      }

      Players.Players.find(
        { id: players_id },
        { id: 1, name: 1, team: 1, stats: 1, position: 1, url: 1 }
      )
        .then((players) => {
          res.json({
            success: "True",
            players: players,
          });
        })
        .catch((error) => {
          res.json({
            success: "False",
            message: error,
          });
          return;
        });
    }
  });
};

const get_all_players = (req, res, next) => {
  if (req.headers.token !== "undefined") {
    let token = jwt.decode(req.headers.token, PRIVATE_KEY_DB);

    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ _id: token._id }).then((user) => {
      if (!user) {
        res.json({
          success: "False",
          message: "User is not registered!",
        });
        return;
      }
    });
  } else {
    res.json({
      success: "False",
      message: "no token, you need to login",
    });
    return;
  }

  response = { F: [], D: [], G: [] };

  Players.DraftForwards.find()
    .then((forwards) => {
      response["F"] = forwards;

      Players.DraftDefenders.find()
        .then((defenders) => {
          response["D"] = defenders;

          Players.DraftGoalies.find()
            .then((goalies) => {
              response["G"] = goalies;

              res.json({
                success: "True",
                message: response,
              });
              return;
            })
            .catch((error) => {
              res.json({
                success: "False",
                message: error,
              });
              return;
            });
        })
        .catch((error) => {
          res.json({
            success: "False",
            message: error,
          });
          return;
        });
    })
    .catch((error) => {
      res.json({
        success: "False",
        message: error,
      });
      return;
    });
};

const get_day_leaders = (req, res, next) => {
  var d = req.headers.d;
  DayLeaders.findOne({ date: d })
    .then((day_leaders) => {
      if (!day_leaders) {
        res.json({
          success: "False",
          message: "No day leaders for this day",
        });
        return;
      }
      res.json({
        success: "True",
        message: day_leaders,
      });
      return;
    })
    .catch((error) => {
      res.json({
        success: "False",
        message: error,
      });
      return;
    });
};

function shuffleArray(arr) {
  arr.sort(() => Math.random() - 0.5);
}

function ValidateUser(encrypt_token) {
  if (encrypt_token !== "undefined") {
    let token = jwt.decode(encrypt_token, PRIVATE_KEY_DB);

    // TODO: use token.iat and token.exp to use token expiration and force user to re-login
    User.findOne({ _id: token._id }).then((user) => {
      if (!user) {
        res.json({
          success: "False",
          message: "User is not registered!",
        });
        return;
      }
    });
  } else {
    res.json({
      success: "False",
      message: "no token, you need to login",
    });
    return;
  }
}

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
};
