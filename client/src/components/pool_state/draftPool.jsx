import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// css
import '../react-tabs.css';

// images
import { logos } from '../img/logos';

// Loader

export default function DraftPool({ user, DictUsers, poolName, poolInfo, setPoolInfo, socket }) {
  const [inRoom, setInRoom] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [def_l, setDef_l] = useState([]);
  const [forw_l, setForw_l] = useState([]);
  const [goal_l, setGoal_l] = useState([]);
  const [searchText, setSearchText] = useState('');

  const sort_by_player_member = (playerMember, array) => {
    // TODO: try to simplified this into no if at all
    if (playerMember !== 'name' && playerMember !== 'team')
      array.sort((a, b) => b.stats[playerMember] - a.stats[playerMember]);
    else {
      array.sort((a, b) => {
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

  const fetchPlayerDraft = () => {
    // get all players stats from past season

    axios.get('/api/pool/get_all_players', { headers: { token: Cookies.get(`token-${user._id}`) } }).then(res => {
      if (res.data.success === false) {
        // props.history.push('/pool_list');
      } else {
        const sortedForwards = sort_by_player_member('pts', res.data.message.F);
        const sortedDefender = sort_by_player_member('pts', res.data.message.D);
        const sortedGoalies = sort_by_player_member('wins', res.data.message.G);

        setForw_l(sortedForwards);
        setDef_l([...sortedDefender]);
        setGoal_l([...sortedGoalies]);
      }
    });
  };

  useEffect(() => {
    if (socket && poolName && user._id) {
      socket.emit('joinRoom', Cookies.get(`token-${user._id}`), poolName);
      fetchPlayerDraft();
      setInRoom(true);
    }
    return () => {
      if (socket && poolName) {
        socket.emit('leaveRoom', Cookies.get(`token-${user._id}`), poolName);
        socket.off('roomData');
        setInRoom(false);
      }
    };
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('poolInfo', data => {
        setPoolInfo(data);
      });
    }
  }, [socket]);

  const sort_players = async (stats, position) => {
    if (position === 'D') {
      let players = def_l;
      players = await sort_by_player_member(stats, def_l);
      setDef_l([...players]);
    } else if (position === 'F') {
      let players = forw_l;
      players = await sort_by_player_member(stats, players);
      setForw_l([...players]);
    } else if (position === 'G') {
      let players = goal_l;
      players = await sort_by_player_member(stats, players);
      setGoal_l([...players]);
    }
  };

  const chose_player = player => {
    socket.emit('pickPlayer', Cookies.get(`token-${user._id}`), poolInfo.name, player, ack => {
      if (ack.success === false) {
        alert(ack.message);
      }
    });
  };

  const search_players = val => {
    setSearchText(val);
  };

  const filter_players = player => {
    if (!player.name.toLowerCase().includes(searchText.toLowerCase())) {
      return null; // not part of the search text
    }

    for (let i = 0; i < poolInfo.participants.length; i += 1) {
      const participant = poolInfo.participants[i];

      if (poolInfo.context[participant].chosen_reservist.findIndex(p => p.id === player.id) > -1) {
        return null; // already picked
      }

      if (player.position === 'D') {
        if (poolInfo.context[participant].chosen_defender.findIndex(p => p.id === player.id) > -1) {
          return null; // already picked
        }
      } else if (player.position === 'F') {
        if (poolInfo.context[participant].chosen_forward.findIndex(p => p.id === player.id) > -1) {
          return null; // already picked
        }
      } else if (poolInfo.context[participant].chosen_goalies.findIndex(p => p.id === player.id) > -1) {
        return null; // already picked
      }
    }

    return player;
  };

  const render_players = players =>
    players.map((player, i) => (
      <tr key={i}>
        <td>{i + 1}</td>
        <td>{player.name}</td>
        <td>
          <img src={logos[player.team]} alt="" width="30" height="30" />
        </td>
      </tr>
    ));

  const isUser = participant => participant === user._id;

  const render_tabs_choice_headers = position => (
    <>
      <tr>
        <th colSpan={3}>{position}</th>
      </tr>
      <tr>
        <th>#</th>
        <th>name</th>
        <th>team</th>
      </tr>
    </>
  );

  const render_tabs_choice = () => {
    const poolers = poolInfo.participants;

    // replace pooler user name to be first
    const i = poolers.findIndex(isUser);
    poolers.splice(i, 1);
    poolers.splice(0, 0, user._id);

    return (
      <Tabs>
        <TabList>
          {poolers.map(pooler => (
            <Tab key={pooler}>{DictUsers[pooler]}</Tab>
          ))}
        </TabList>
        {poolers.map(pooler => (
          <TabPanel key={pooler}>
            <table className="content-table">
              <thead>{render_tabs_choice_headers('Forwards')}</thead>
              <tbody>{render_players(poolInfo.context[pooler].chosen_forward)}</tbody>
            </table>
            <table className="content-table">
              <thead>{render_tabs_choice_headers('Defenders')}</thead>
              <tbody>{render_players(poolInfo.context[pooler].chosen_defender)}</tbody>
            </table>
            <table className="content-table">
              <thead>{render_tabs_choice_headers('Goalies')}</thead>
              <tbody>{render_players(poolInfo.context[pooler].chosen_goalies)}</tbody>
            </table>
            <table className="content-table">
              <thead>{render_tabs_choice_headers('Reservists')}</thead>
              <tbody>{render_players(poolInfo.context[pooler].chosen_reservist)}</tbody>
            </table>
          </TabPanel>
        ))}
      </Tabs>
    );
  };

  const render_color_user_turn = () => {
    let textColor = 'red-text';

    if (poolInfo.next_drafter === user._id) {
      textColor = 'green-text';
    }

    return (
      <h2 className={textColor}>
        {DictUsers[poolInfo.next_drafter]}
        &apos;s turn
      </h2>
    );
  };

  const render_last_season_stats = (position, players) => (
    <table className="content-table">
      <thead>
        <tr>
          <th colSpan={6}>Forward stats during last season</th>
        </tr>
        <tr>
          <th onClick={() => sort_players('name', position)}>name</th>
          <th onClick={() => sort_players('team', position)}>team</th>
          <th onClick={() => sort_players('games', position)}>Games played</th>
          {position === 'F' || position === 'D' ? (
            <>
              <th onClick={() => sort_players('goals', position)}>Goals</th>
              <th onClick={() => sort_players('assists', position)}>Assists</th>
              <th onClick={() => sort_players('pts', position)}>pts</th>
            </>
          ) : (
            <>
              <th onClick={() => sort_players('wins', position)}>Win</th>
              <th onClick={() => sort_players('losses', position)}>losses</th>
              <th onClick={() => sort_players('savePercentage', position)}>save percentage</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {players
          .filter(player => filter_players(player))
          .map(player => (
            <tr
              onClick={() =>
                setSelectedPlayer({
                  id: player.id,
                  name: player.name,
                  team: player.team,
                  position: player.position,
                })
              }
              key={player.id}
            >
              <td>
                {selectedPlayer && selectedPlayer.id === player.id ? ( // Add a button to draft a player when we select a player.
                  <button className="base_button" onClick={() => chose_player(selectedPlayer)} type="button">
                    Draft
                  </button>
                ) : null}
                {player.name}
              </td>
              <td>
                <img src={logos[player.team]} alt="" width="30" height="30" />
              </td>
              <td>{player.stats.games}</td>
              {position === 'F' || position === 'D' ? (
                <>
                  <td>{player.stats.goals}</td>
                  <td>{player.stats.assists}</td>
                  <td>{player.stats.pts}</td>
                </>
              ) : (
                <>
                  <td>{player.stats.wins}</td>
                  <td>{player.stats.losses}</td>
                  <td>{player.stats.savePercentage}</td>
                </>
              )}
            </tr>
          ))}
      </tbody>
    </table>
  );

  if (poolInfo && inRoom) {
    return (
      <div>
        <h1>Draft for pool {poolInfo.name}</h1>
        <div className="cont">
          {render_color_user_turn()}
          <div className="floatLeft">
            <div>
              <input type="text" placeholder="Search..." onChange={event => search_players(event.target.value)} />
            </div>
            <Tabs>
              <TabList>
                <Tab>Forwards</Tab>
                <Tab>Defenders</Tab>
                <Tab>Goalies</Tab>
              </TabList>
              <TabPanel>{render_last_season_stats('F', forw_l)}</TabPanel>
              <TabPanel>{render_last_season_stats('D', def_l)}</TabPanel>
              <TabPanel>{render_last_season_stats('G', goal_l)}</TabPanel>
            </Tabs>
          </div>
          <div className="floatRight">
            <div>{render_tabs_choice()}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>trying to join the pool draft...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

DraftPool.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string.isRequired, _id: PropTypes.string.isRequired }).isRequired,
  poolName: PropTypes.string.isRequired,
  poolInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    context: PropTypes.arrayOf(
      PropTypes.shape({
        chosen_forward: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_defender: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_goalies: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_reservist: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        nb_defender: PropTypes.number.isRequired,
        nb_forward: PropTypes.number.isRequired,
        nb_goalies: PropTypes.number.isRequired,
        nb_reservist: PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    next_season_number_players_protected: PropTypes.number.isRequired,
    number_forward: PropTypes.number.isRequired,
    number_defenders: PropTypes.number.isRequired,
    number_goalies: PropTypes.number.isRequired,
    number_reservist: PropTypes.number.isRequired,
    next_drafter: PropTypes.string.isRequired,
  }).isRequired,
  setPoolInfo: PropTypes.func.isRequired,
  socket: PropTypes.shape({
    emit: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
  }).isRequired,
};
