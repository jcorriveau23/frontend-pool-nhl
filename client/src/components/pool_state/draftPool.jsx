import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// Icons
import { AiFillStar } from 'react-icons/ai';
import { BsPenFill } from 'react-icons/bs';

// components
import PlayerList from './playerList';
import DraftOrder from './draftOrder';
import PlayerNoLink from '../playerNoLink';

// css
import '../react-tabs.css';

// images
import { logos } from '../img/logos';

export default function DraftPool({
  user,
  DictUsers,
  poolName,
  poolInfo,
  setPoolInfo,
  injury,
  socket,
  isUserParticipant,
}) {
  const [inRoom, setInRoom] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [def_l, setDef_l] = useState([]);
  const [forw_l, setForw_l] = useState([]);
  const [goal_l, setGoal_l] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [playerIdToPlayerNameDict, setPlayerIdToPlayerNameDict] = useState(null);

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

    axios.get('/players.json', { headers: { token: Cookies.get(`token-${user._id.$oid}`) } }).then(res => {
      const sortedForwards = sort_by_player_member('pts', res.data.F);
      const sortedDefender = sort_by_player_member('pts', res.data.D);
      const sortedGoalies = sort_by_player_member('wins', res.data.G);

      setForw_l(sortedForwards);
      setDef_l(sortedDefender);
      setGoal_l(sortedGoalies);
    });
  };

  const setDictPlayersIdToPlayersName = poolData => {
    const DictPlayerIdToPlayerName = {};

    for (const [poolerName, poolerRoster] of Object.entries(poolData.context.pooler_roster)) {
      console.log(poolerRoster);
      // Forwards
      poolerRoster.chosen_forwards.forEach(forward => {
        DictPlayerIdToPlayerName[forward.id] = forward.name;
      });
      // Defenders
      poolerRoster.chosen_defenders.forEach(defender => {
        DictPlayerIdToPlayerName[defender.id] = defender.name;
      });
      // Goalies
      poolerRoster.chosen_goalies.forEach(goaly => {
        DictPlayerIdToPlayerName[goaly.id] = goaly.name;
      });
      // Reservists
      poolerRoster.chosen_reservists.forEach(reservist => {
        DictPlayerIdToPlayerName[reservist.id] = reservist.name;
      });
    }

    setPlayerIdToPlayerNameDict(DictPlayerIdToPlayerName);
  };

  useEffect(() => {
    if (socket && poolName && user._id) {
      socket.emit('joinRoom', Cookies.get(`token-${user._id.$oid}`), poolName);
      fetchPlayerDraft();
      setInRoom(true);
      setDictPlayersIdToPlayersName(poolInfo); // Create the dictionary mapping players id to players name
    }
    return () => {
      if (socket && poolName) {
        socket.emit('leaveRoom', Cookies.get(`token-${user._id.$oid}`), poolName);
        socket.off('roomData');
        setInRoom(false);
      }
    };
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('poolInfo', data => {
        setPoolInfo(data);
        setDictPlayersIdToPlayersName(data); // Create the dictionary mapping players id to players name
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
    socket.emit('pickPlayer', Cookies.get(`token-${user._id.$oid}`), poolInfo.name, player, ack => {
      if (ack.success === false) {
        alert(ack.message);
      }
    });
  };

  const confirm_selection = player => {
    if (window.confirm(`Do you really want to select ${player.name}?`)) {
      chose_player(player);
    }
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

      if (poolInfo.context.pooler_roster[participant].chosen_reservists.findIndex(p => p.id === player.id) > -1) {
        return null; // already picked
      }

      if (player.position === 'D') {
        if (poolInfo.context.pooler_roster[participant].chosen_defenders.findIndex(p => p.id === player.id) > -1) {
          return null; // already picked
        }
      } else if (player.position === 'F') {
        if (poolInfo.context.pooler_roster[participant].chosen_forwards.findIndex(p => p.id === player.id) > -1) {
          return null; // already picked
        }
      } else if (poolInfo.context.pooler_roster[participant].chosen_goalies.findIndex(p => p.id === player.id) > -1) {
        return null; // already picked
      }
    }

    return player;
  };

  const isUser = participant => participant === user._id.$oid;

  const draft_turn = () => {
    if (poolInfo.final_rank) {
      // Comes from dynastie

      const number_players_drafted = poolInfo.context.players_name_drafted.length;
      const next_drafter =
        poolInfo.final_rank[poolInfo.number_poolers - 1 - (number_players_drafted % poolInfo.number_poolers)]; // The last one have the first pick

      const round = number_players_drafted / poolInfo.number_poolers;

      if (poolInfo.tradable_picks && poolInfo.tradable_picks.length > round) {
        return poolInfo.tradable_picks[round][next_drafter]; // tradable picks
      }
      return next_drafter; // No more tradable picks
    }
    // comes from new draft

    const number_players_drafted = poolInfo.context.players_name_drafted.length;
    return poolInfo.participants[number_players_drafted % poolInfo.number_poolers];
  };

  const render_pooler_turn = pooler => {
    if (draft_turn() === pooler) {
      return (
        <Tab key={pooler} style={{ color: 'green' }}>
          <AiFillStar size={30} />
          <b>{DictUsers ? DictUsers[pooler] : pooler}</b>
        </Tab>
      );
    }

    return <Tab key={pooler}>{DictUsers ? DictUsers[pooler] : pooler}</Tab>;
  };

  const render_tabs_choice = () => {
    const poolers = poolInfo.participants;

    // replace pooler user name to be first
    if (isUserParticipant) {
      const i = poolers.findIndex(isUser);
      poolers.splice(i, 1);
      poolers.splice(0, 0, user._id.$oid);
    }

    return (
      <Tabs>
        <TabList>
          <Tab>
            <BsPenFill size={30} />
            Draft Order
          </Tab>
          <Tab>Teams</Tab>
        </TabList>
        <TabPanel>
          <DraftOrder
            players_name_drafted={poolInfo.context.players_name_drafted}
            participants={poolInfo.participants}
            final_rank={poolInfo.final_rank}
            tradable_picks={poolInfo.context.tradable_picks}
            nb_players={
              poolInfo.number_forwards +
              poolInfo.number_defenders +
              poolInfo.number_goalies +
              poolInfo.number_reservists
            }
            nb_protected_players={poolInfo.next_season_number_players_protected}
            injury={injury}
            playerIdToPlayerNameDict={playerIdToPlayerNameDict}
            DictUsers={DictUsers}
          />
        </TabPanel>
        <TabPanel>
          <Tabs selectedIndex={selectedTeamIndex} onSelect={index => setSelectedTeamIndex(index)}>
            <TabList>{poolers.map(pooler => render_pooler_turn(pooler))}</TabList>
            {poolers.map(pooler => (
              <TabPanel key={pooler}>
                <PlayerList poolerContext={poolInfo.context.pooler_roster[pooler]} injury={injury} />
              </TabPanel>
            ))}
          </Tabs>
        </TabPanel>
      </Tabs>
    );
  };

  const render_last_season_stats = (position, players) => (
    <table className="content-table-no-min">
      <thead>
        <tr>
          <th colSpan={7}>Stats during last season</th>
        </tr>
        <tr>
          <th colSpan={2} onClick={() => sort_players('name', position)}>
            name
          </th>
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
                  <button className="draft-button" onClick={() => confirm_selection(selectedPlayer)} type="button">
                    Draft
                  </button>
                ) : null}
              </td>
              <td>
                <PlayerNoLink name={player.name} injury={injury} />
              </td>
              <td>
                <img src={logos[player.team]} alt="" width="40" height="40" />
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

  if (inRoom) {
    return (
      <div className="min-width">
        <div className="cont">
          <table className="content-table-no-min">
            <tbody>
              <tr>
                <th colSpan={2}>Pool Info</th>
              </tr>
              <tr>
                <th>Pool name:</th>
                <td>{poolInfo.name}</td>
              </tr>
              <tr>
                <th>Pool status: </th>
                <td>{poolInfo.status}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="float-left">
            <div className="half-cont">
              <input type="text" placeholder="Search..." onChange={event => search_players(event.target.value)} />
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
          </div>
          <div className="float-right">
            <div className="half-cont">{render_tabs_choice()}</div>
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
  DictUsers: PropTypes.shape({}).isRequired,
  poolName: PropTypes.string.isRequired,
  poolInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
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
  }).isRequired,
  setPoolInfo: PropTypes.func.isRequired,
  socket: PropTypes.shape({
    emit: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
  }).isRequired,
};
