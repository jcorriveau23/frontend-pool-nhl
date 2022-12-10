import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// Logos
import { AiFillCheckCircle } from 'react-icons/ai';
import { BsPenFill } from 'react-icons/bs';
import { GiDirectionSigns } from 'react-icons/gi';

// Components
import PlayerLink from '../playerLink';
import DraftOrder from './draftOrder';
import User from '../user';

// Images
import { logos } from '../img/logos';

export default function DynastiePool({
  user,
  DictUsers,
  poolInfo,
  playerIdToPlayersDataMap,
  playersIdToPoolerMap,
  setPoolUpdate,
  injury,
}) {
  const [forwProtected, setForwProtected] = useState([]);
  const [defProtected, setDefProtected] = useState([]);
  const [goalProtected, setGoalProtected] = useState([]);
  const [reservProtected, setReservProtected] = useState([]);
  const [tabIndex, setTabIndex] = useState(
    poolInfo.participants.findIndex(participant => participant === user._id.$oid)
  );

  const protect_player = (player, isUser) => {
    if (!isUser) {
      // alert(`You cannot protect a player you don't own.`);
      return;
    }

    const number_protected = defProtected.length + forwProtected.length + goalProtected.length + reservProtected.length;

    let add_to_reservist = false;

    if (number_protected < poolInfo.next_season_number_players_protected) {
      if (player.position === 'D') {
        if (defProtected.length < poolInfo.number_defenders) {
          const changedArray = defProtected;
          changedArray.push(player);

          setDefProtected([...changedArray]);
        } else {
          add_to_reservist = true;
        }
      } else if (player.position === 'F') {
        if (forwProtected.length < poolInfo.number_forwards) {
          const changedArray = forwProtected;
          changedArray.push(player);

          setForwProtected([...changedArray]);
        } else {
          add_to_reservist = true;
        }
      } else if (player.position === 'G') {
        if (goalProtected.length < poolInfo.number_goalies) {
          const changedArray = goalProtected;
          changedArray.push(player);

          setGoalProtected([...changedArray]);
        } else {
          add_to_reservist = true;
        }
      }

      if (add_to_reservist) {
        if (reservProtected.length < poolInfo.number_reservists) {
          const changedArray = reservProtected;
          changedArray.push(player);

          setReservProtected([...changedArray]);
        } else alert(`You cannot have more than ${poolInfo.number_reservists} reservists`);
      }
    } else alert(`You cannot protect more than ${poolInfo.next_season_number_players_protected} players`);
  };

  const unprotect_player = (player, isReservist) => {
    if (defProtected.length + forwProtected.length + goalProtected.length + reservProtected.length > 0) {
      if (player.position === 'D') {
        if (!isReservist) {
          const protected_player_array = defProtected;
          const i = protected_player_array.indexOf(player);
          if (i > -1) {
            protected_player_array.splice(i, 1);
          }
          setDefProtected([...protected_player_array]);
        }
      } else if (player.position === 'F') {
        if (!isReservist) {
          const protected_player_array = forwProtected;
          const i = protected_player_array.indexOf(player);
          if (i > -1) {
            protected_player_array.splice(i, 1);
          }
          setForwProtected([...protected_player_array]);
        }
      } else if (player.position === 'G') {
        if (!isReservist) {
          const protected_player_array = goalProtected;
          const i = protected_player_array.indexOf(player);
          if (i > -1) {
            protected_player_array.splice(i, 1);
          }

          setGoalProtected([...protected_player_array]);
        }
      }

      // remove from reservist protected player
      if (isReservist) {
        const protected_player_array = reservProtected;
        const i = protected_player_array.indexOf(player);
        if (i > -1) {
          protected_player_array.splice(i, 1);
        }
        setReservProtected([...protected_player_array]);
      }
    }
  };

  const send_protected_player = () => {
    if (
      !window.confirm(
        `Are you sure you want to send this list of protected players? This action is not reversible, Make sure you are confortable with your choices before confirming.`
      )
    ) {
      return;
    }

    const number_protected_player =
      defProtected.length + forwProtected.length + goalProtected.length + reservProtected.length;

    if (number_protected_player === poolInfo.next_season_number_players_protected) {
      axios
        .post(
          '/api-rust/protect-players',
          {
            name: poolInfo.name,
            forw_protected: forwProtected,
            def_protected: defProtected,
            goal_protected: goalProtected,
            reserv_protected: reservProtected,
          },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
          }
        )
        .then(res => {
          if (res.data.success === true) {
            setPoolUpdate(true);
            setForwProtected([]);
            setDefProtected([]);
            setGoalProtected([]);
            setReservProtected([]);
            alert('You have successfully sent your protection player list.');
          } else {
            alert(res.data.message);
          }
        });
    } else alert(`You need to protect ${poolInfo.next_season_number_players_protected} players`);
  };

  const render_not_protected_players = (players, isUser, isDone) =>
    players
      .filter(player => {
        if (
          forwProtected.findIndex(p => p.id === player.id) === -1 &&
          defProtected.findIndex(p => p.id === player.id) === -1 &&
          goalProtected.findIndex(p => p.id === player.id) === -1 &&
          reservProtected.findIndex(p => p.id === player.id) === -1
        ) {
          return player;
        }
        return null;
      })
      .map((player, i) => (
        <tr onClick={isDone ? null : () => protect_player(player, isUser)} key={player.id}>
          <td>{i + 1}</td>
          <td>
            <PlayerLink name={player.name} injury={injury} isLink={false} />
          </td>
          <td>
            <img src={logos[player.team]} alt="" width="40" height="40" />
          </td>
        </tr>
      ));

  const render_position_header = position => (
    <thead>
      <tr>
        <th colSpan={3}>{position}</th>
      </tr>
      <tr>
        <th>#</th>
        <th>name</th>
        <th>team</th>
      </tr>
    </thead>
  );

  const render_protected_players = players => (
    <tbody>
      {players.map((player, i) => (
        <tr onClick={() => unprotect_player(player, false)} key={player.id}>
          <td>{i + 1}</td>
          <td>
            <PlayerLink name={player.name} injury={injury} isLink={false} />
          </td>
          <td>
            <img src={logos[player.team]} alt="" width="40" height="40" />
          </td>
        </tr>
      ))}
    </tbody>
  );

  const isParticipantDone = participant => {
    const nb_player =
      poolInfo.context.pooler_roster[participant].chosen_forwards.length +
      poolInfo.context.pooler_roster[participant].chosen_defenders.length +
      poolInfo.context.pooler_roster[participant].chosen_goalies.length +
      poolInfo.context.pooler_roster[participant].chosen_reservists.length;

    return nb_player <= poolInfo.next_season_number_players_protected;
  };

  const nb_player_protected =
    forwProtected.length + defProtected.length + goalProtected.length + reservProtected.length;

  return (
    <div className="cont">
      <Tabs>
        <TabList>
          <Tab>
            <GiDirectionSigns size={40} />
            Protection
          </Tab>
          <Tab>
            <BsPenFill size={30} />
            Preview Draft Order
          </Tab>
        </TabList>
        <TabPanel>
          <div className="float-left">
            <div className="half-cont">
              <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                <TabList>
                  {poolInfo.participants.map(participant => (
                    <Tab>
                      {isParticipantDone(participant) ? <AiFillCheckCircle size={30} color="green" /> : null}
                      <User id={participant} user={user} DictUsers={DictUsers} />
                    </Tab>
                  ))}
                </TabList>
                {poolInfo.participants.map(participant => (
                  <TabPanel>
                    <h2>
                      {participant === user._id.$oid
                        ? `Protect ${poolInfo.next_season_number_players_protected} players.`
                        : null}
                    </h2>
                    <table className="content-table-no-min">
                      {render_position_header('Forward')}
                      <tbody>
                        {render_not_protected_players(
                          poolInfo.context.pooler_roster[participant].chosen_forwards,
                          participant === user._id.$oid,
                          isParticipantDone(user._id.$oid)
                        )}
                      </tbody>
                      {render_position_header('Defenders')}
                      <tbody>
                        {render_not_protected_players(
                          poolInfo.context.pooler_roster[participant].chosen_defenders,
                          participant === user._id.$oid,
                          isParticipantDone(user._id.$oid)
                        )}
                      </tbody>
                      {render_position_header('Goalies')}
                      <tbody>
                        {render_not_protected_players(
                          poolInfo.context.pooler_roster[participant].chosen_goalies,
                          participant === user._id.$oid,
                          isParticipantDone(user._id.$oid)
                        )}
                      </tbody>
                      {render_position_header('Reservists')}
                      <tbody>
                        {render_not_protected_players(
                          poolInfo.context.pooler_roster[participant].chosen_reservists,
                          participant === user._id.$oid,
                          isParticipantDone(user._id.$oid)
                        )}
                      </tbody>
                    </table>
                  </TabPanel>
                ))}
              </Tabs>
            </div>
          </div>
          <div className="float-right">
            <div className="half-cont">
              {!isParticipantDone(user._id.$oid) ? (
                <>
                  <h2>
                    My Protected players ({nb_player_protected}/{poolInfo.next_season_number_players_protected})
                  </h2>
                  <table className="content-table-no-min">
                    {render_position_header('Forwards')}
                    {render_protected_players(forwProtected)}
                    {render_position_header('Defenders')}
                    {render_protected_players(defProtected)}
                    {render_position_header('Goalies')}
                    {render_protected_players(goalProtected)}
                    {render_position_header('Reservists')}
                    {render_protected_players(reservProtected)}
                  </table>
                  <button
                    className="base-button"
                    onClick={() => send_protected_player()}
                    disabled={nb_player_protected !== poolInfo.next_season_number_players_protected}
                    type="button"
                  >
                    Send Protection list
                  </button>
                </>
              ) : (
                <h2>
                  You have already protected your {poolInfo.next_season_number_players_protected} players. Waiting for
                  {poolInfo.participants.map(participant =>
                    !isParticipantDone(participant) ? (DictUsers ? ` ${DictUsers[participant]}, ` : null) : null
                  )}
                  to complete the process...
                </h2>
              )}
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <DraftOrder
            poolInfo={poolInfo}
            playerIdToPlayersDataMap={playerIdToPlayersDataMap}
            injury={injury}
            DictUsers={DictUsers}
            user={user}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
}

DynastiePool.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string.isRequired, _id: PropTypes.string.isRequired }).isRequired,
  poolInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    context: PropTypes.arrayOf(
      PropTypes.shape({
        chosen_forwards: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_defenders: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_goalies: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        chosen_reservists: PropTypes.arrayOf(
          PropTypes.shape({ name: PropTypes.string.isRequired, team: PropTypes.string.isRequired }).isRequired
        ).isRequired,
        nb_defender: PropTypes.number.isRequired,
        nb_forward: PropTypes.number.isRequired,
        nb_goalies: PropTypes.number.isRequired,
        nb_reservist: PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
    next_season_number_players_protected: PropTypes.number.isRequired,
  }).isRequired,
  setPoolUpdate: PropTypes.func.isRequired,
  socket: PropTypes.shape({
    emit: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
  }).isRequired,
};
