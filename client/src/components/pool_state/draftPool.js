import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import '../react-tabs.css';
import logos from '../img/images';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

function DraftPool({ username, poolName, poolInfo, setPoolInfo, socket }) {
  const [inRoom, setInRoom] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('select a player');
  const [def_l, setDef_l] = useState([]);
  const [forw_l, setForw_l] = useState([]);
  const [goal_l, setGoal_l] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (socket && poolName && username) {
      socket.emit('joinRoom', Cookies.get('token-' + username), poolName);
      fetchPlayerDraft();
      setInRoom(true);
    }
    return () => {
      if (socket && poolName) {
        socket.emit('leaveRoom', Cookies.get('token-' + username), poolName);
        socket.off('roomData');
        setInRoom(false);
      }
    };
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (socket) {
      socket.on('poolInfo', data => {
        setPoolInfo(data);
      });
    }
  }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

  // Draft methods
  const fetchPlayerDraft = async () => {
    var cookie = Cookies.get('token-' + username);

    // get all players stats from past season
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', token: cookie },
    };
    fetch('../pool/get_all_players', requestOptions)
      .then(response => response.json())
      .then(data => {
        if (data.success === 'False') {
          //props.history.push('/pool_list');
        } else {
          var sortedForwards = [];
          var sortedDefender = [];
          var sortedGoalies = [];

          sortedForwards = sort_by_player_member('pts', data.message['F']);
          sortedDefender = sort_by_player_member('pts', data.message['D']);
          sortedGoalies = sort_by_player_member('wins', data.message['G']);

          setForw_l([...sortedForwards]);
          setDef_l([...sortedDefender]);
          setGoal_l([...sortedGoalies]);
        }
      });
  };

  const sort_players = async (stats, position) => {
    var players = [];

    if (position === 'D') {
      players = def_l;
      players = await sort_by_player_member(stats, def_l);
      setDef_l([...players]);
    } else if (position === 'F') {
      players = forw_l;
      players = await sort_by_player_member(stats, players);
      setForw_l([...players]);
    } else if (position === 'G') {
      players = goal_l;
      players = await sort_by_player_member(stats, players);
      setGoal_l([...players]);
    }
  };

  const sort_by_player_member = (playerMember, array) => {
    // TODO: try to simplified this into no if at all
    if (playerMember !== 'name' && playerMember !== 'team')
      array.sort(function (a, b) {
        return b.stats[playerMember] - a.stats[playerMember];
      });
    else {
      array.sort(function (a, b) {
        if (a[playerMember] < b[playerMember]) {
          return -1;
        }
        if (a[playerMember] > b[playerMember]) {
          return 1;
        }
        return 0;
      });
    }

    return array;
  };

  const player_selection = (name, team, role) => {
    setSelectedPlayer({ name: name, team: team, role: role });
  };

  const chose_player = player => {
    socket.emit(
      'pickPlayer',
      Cookies.get('token-' + username),
      poolInfo.name,
      player,
      ack => {
        if (ack.success === 'False') {
          setMessage(ack.message);
        } else {
          setMessage('');
        }
      }
    );
  };

  const search_players = val => {
    setSearchText(val);
  };

  const filter_players = player => {
    var participant;

    if (!player.name.toLowerCase().includes(searchText.toLowerCase())) {
      return true; // not part of the search text
    }

    for (var i = 0; i < poolInfo.participants.length; i++) {
      participant = poolInfo.participants[i];

      if (
        poolInfo.context[participant].chosen_reservist.findIndex(
          p => p.name === player.name && p.team === player.team
        ) > -1
      ) {
        return true; // already picked
      }

      if (player.position === 'D') {
        if (
          poolInfo.context[participant].chosen_defender.findIndex(
            p => p.name === player.name && p.team === player.team
          ) > -1
        ) {
          return true; // already picked
        }
      } else if (player.position === 'F') {
        if (
          poolInfo.context[participant].chosen_forward.findIndex(
            p => p.name === player.name && p.team === player.team
          ) > -1
        ) {
          return true; // already picked
        }
      } else {
        if (
          poolInfo.context[participant].chosen_goalies.findIndex(
            p => p.name === player.name && p.team === player.team
          ) > -1
        ) {
          return true; // already picked
        }
      }
    }
    return false; // part of the search text and available
  };

  const render_defender = pooler => {
    if (poolInfo['context'][pooler]) {
      return poolInfo['context'][pooler]['chosen_defender'].map((player, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="30" height="30"></img>
          </td>
        </tr>
      ));
    } else {
      return;
    }
  };

  const render_forward = pooler => {
    if (poolInfo['context'][pooler]) {
      return poolInfo['context'][pooler]['chosen_forward'].map((player, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="30" height="30"></img>
          </td>
        </tr>
      ));
    } else {
      return;
    }
  };

  const render_reservist = pooler => {
    if (poolInfo['context'][pooler]) {
      return poolInfo['context'][pooler]['chosen_reservist'].map(
        (player, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{player.name}</td>
            <td>
              <img src={logos[player.team]} alt="" width="30" height="30"></img>
            </td>
          </tr>
        )
      );
    } else {
      return;
    }
  };

  const render_goalies = pooler => {
    if (poolInfo['context'][pooler]) {
      return poolInfo['context'][pooler]['chosen_goalies'].map((player, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="30" height="30"></img>
          </td>
        </tr>
      ));
    } else {
      return;
    }
  };

  const isUser = participant => {
    return participant === username;
  };

  const render_tabs_choice = () => {
    if (poolInfo['participants']) {
      var poolers = poolInfo['participants'];

      // replace pooler user name to be first
      var i = poolers.findIndex(isUser);
      poolers.splice(i, 1);
      poolers.splice(0, 0, username);

      return (
        <Tabs>
          <TabList>
            {poolers.map((pooler, i) => (
              <Tab key={i}>{pooler}</Tab>
            ))}
          </TabList>
          {poolers.map((pooler, i) => {
            return (
              <TabPanel>
                <table className="content-table">
                  <thead>
                    <tr>
                      <th colSpan={3}>Forwards</th>
                    </tr>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  <tbody>{render_forward(pooler)}</tbody>
                </table>
                <table className="content-table">
                  <thead>
                    <tr>
                      <th colSpan={3}>Defenders</th>
                    </tr>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  <tbody>{render_defender(pooler)}</tbody>
                </table>
                <table className="content-table">
                  <thead>
                    <tr>
                      <th colSpan={3}>Goalies</th>
                    </tr>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  <tbody>{render_goalies(pooler)}</tbody>
                </table>
                <table className="content-table">
                  <thead>
                    <tr>
                      <th colSpan={3}>Reservists</th>
                    </tr>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  <tbody>{render_reservist(pooler)}</tbody>
                </table>
              </TabPanel>
            );
          })}
        </Tabs>
      );
    } else {
      return;
    }
  };

  const render_color_user_turn = () => {
    if (poolInfo.next_drafter === username) {
      return <h2 className="green-text">{poolInfo.next_drafter}'s turn</h2>;
    } else {
      return <h2 className="red-text">{poolInfo.next_drafter}'s turn</h2>;
    }
  };

  if (poolInfo && inRoom) {
    return (
      <div>
        <h1>Draft for pool {poolInfo.name}</h1>
        <div className="container">
          <h1>Stats last season</h1>
          <div className="floatLeft">
            <input
              type="text"
              placeholder="Search..."
              onChange={event => search_players(event.target.value)}
            />
            <Tabs>
              <TabList>
                <Tab>Forwards</Tab>
                <Tab>Defenders</Tab>
                <Tab>Goalies</Tab>
              </TabList>
              <TabPanel>
                <table className="content-table">
                  <tbody>
                    <tr>
                      <th onClick={() => sort_players('name', 'F')}>name</th>
                      <th onClick={() => sort_players('team', 'F')}>team</th>
                      <th onClick={() => sort_players('games', 'F')}>
                        Games played
                      </th>
                      <th onClick={() => sort_players('goals', 'F')}>Goals</th>
                      <th onClick={() => sort_players('assists', 'F')}>
                        Assists
                      </th>
                      <th onClick={() => sort_players('pts', 'F')}>pts</th>
                    </tr>
                    {forw_l
                      .filter(player => {
                        if (filter_players(player) === false) {
                          return player;
                        }
                        return null;
                      })
                      .map((player, i) => (
                        <tr
                          onClick={() =>
                            player_selection(player.name, player.team, 'F')
                          }
                          key={i}
                        >
                          <td>{player.name}</td>
                          <td>
                            <img
                              src={logos[player.team]}
                              alt=""
                              width="30"
                              height="30"
                            ></img>
                          </td>
                          <td>{player.stats.games}</td>
                          <td>{player.stats.goals}</td>
                          <td>{player.stats.assists}</td>
                          <td>{player.stats.pts}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </TabPanel>
              <TabPanel>
                <table className="content-table">
                  <tbody>
                    <tr>
                      <th onClick={() => sort_players('name', 'D')}>name</th>
                      <th onClick={() => sort_players('team', 'D')}>team</th>
                      <th onClick={() => sort_players('games', 'D')}>
                        Games played
                      </th>
                      <th onClick={() => sort_players('goals', 'D')}>Goals</th>
                      <th onClick={() => sort_players('assists', 'D')}>
                        Assists
                      </th>
                      <th onClick={() => sort_players('pts', 'D')}>pts</th>
                    </tr>
                    {def_l
                      .filter(player => {
                        if (filter_players(player) === false) {
                          return player;
                        }
                        return null;
                      })
                      .map((player, i) => (
                        <tr
                          onClick={() =>
                            player_selection(player.name, player.team, 'D')
                          }
                          key={i}
                        >
                          <td>{player.name}</td>
                          <td>
                            <img
                              src={logos[player.team]}
                              alt=""
                              width="30"
                              height="30"
                            ></img>
                          </td>
                          <td>{player.stats.games}</td>
                          <td>{player.stats.goals}</td>
                          <td>{player.stats.assists}</td>
                          <td>{player.stats.pts}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </TabPanel>
              <TabPanel>
                <table className="content-table">
                  <tbody>
                    <tr>
                      <th onClick={() => sort_players('name', 'G')}>name</th>
                      <th onClick={() => sort_players('team', 'G')}>team</th>
                      <th onClick={() => sort_players('games', 'G')}>
                        Games played
                      </th>
                      <th onClick={() => sort_players('wins', 'G')}>Win</th>
                      <th onClick={() => sort_players('losses', 'G')}>
                        losses
                      </th>
                      <th onClick={() => sort_players('savePercentage', 'G')}>
                        save percentage
                      </th>
                    </tr>
                    {goal_l
                      .filter(player => {
                        if (filter_players(player) === false) {
                          return player;
                        }
                        return null;
                      })
                      .map((player, i) => (
                        <tr
                          onClick={() =>
                            player_selection(player.name, player.team, 'G')
                          }
                          key={i}
                        >
                          <td>{player.name}</td>
                          <td>
                            <img
                              src={logos[player.team]}
                              alt=""
                              width="30"
                              height="30"
                            ></img>
                          </td>
                          <td>{player.stats.games}</td>
                          <td>{player.stats.wins}</td>
                          <td>{player.stats.losses}</td>
                          <td>{player.stats.savePercentage}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </TabPanel>
            </Tabs>
          </div>
          <div className="floatRight">
            <div className="floatLeft">
              {render_color_user_turn()}
              <h1>{selectedPlayer.name}</h1>
              <h3 className="red-text">{message}</h3>
              <button
                onClick={() => chose_player(selectedPlayer)}
                disabled={false}
              >
                choose
              </button>
            </div>
            <div className="floatRight">{render_tabs_choice()}</div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <h1>trying to join the pool draft...</h1>
        <ClipLoader color="#fff" loading={true} /*css={override}*/ size={75} />
      </div>
    );
  }
}
export default DraftPool;
