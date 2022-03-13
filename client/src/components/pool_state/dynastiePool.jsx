import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// images
import { logos } from '../img/logos';

export default function DynastiePool({ username, poolName, poolInfo, setPoolInfo, socket }) {
  const [inRoom, setInRoom] = useState([]);

  const [forwProtected, setForwProtected] = useState([]);
  const [defProtected, setDefProtected] = useState([]);
  const [goalProtected, setGoalProtected] = useState([]);
  const [reservProtected, setReservProtected] = useState([]);

  useEffect(() => {
    if (socket && poolName) {
      // TODO: add some validation server socket side to prevent someone joining the pool
      // when there is already the maximum poolers in the room
      socket.emit('joinRoom', Cookies.get(`token-${username}`), poolName);
      setInRoom(true);
    }
    return () => {
      if (socket && poolName) {
        socket.emit('leaveRoom', Cookies.get(`token-${username}`), poolName);
        socket.off('roomData');
        setInRoom(false);
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('poolInfo', data => {
        setPoolInfo(data);
      });
    }
  }, [socket]);

  const protect_player = player => {
    const number_protected = defProtected.length + forwProtected.length + goalProtected.length;

    let add_to_reservist = false;

    if (number_protected < poolInfo.next_season_number_players_protected) {
      if (player.role === 'D') {
        if (defProtected.length < poolInfo.number_defenders) {
          const changedArray = defProtected;
          changedArray.push(player);

          setDefProtected([...changedArray]);
        } else {
          add_to_reservist = true;
        }
      } else if (player.role === 'F') {
        if (forwProtected.length < poolInfo.number_forward) {
          const changedArray = forwProtected;
          changedArray.push(player);

          setForwProtected([...changedArray]);
        } else {
          add_to_reservist = true;
        }
      } else if (player.role === 'G') {
        if (goalProtected.length < poolInfo.number_goalies) {
          const changedArray = goalProtected;
          changedArray.push(player);

          setGoalProtected([...changedArray]);
        } else {
          add_to_reservist = true;
        }
      }

      if (add_to_reservist) {
        if (reservProtected.length < poolInfo.number_reservist) {
          const changedArray = reservProtected;
          changedArray.push(player);

          setReservProtected([...changedArray]);
        }
      }
    }
  };

  const unprotect_player = (player, isReservist) => {
    if (defProtected.length + forwProtected.length + goalProtected.length + reservProtected.length > 0) {
      if (player.role === 'D') {
        if (!isReservist) {
          const protected_player_array = defProtected;
          const i = protected_player_array.indexOf(player);
          if (i > -1) {
            protected_player_array.splice(i, 1);
          }
          setDefProtected([...protected_player_array]);
        }
      } else if (player.role === 'F') {
        if (!isReservist) {
          const protected_player_array = forwProtected;
          const i = protected_player_array.indexOf(player);
          if (i > -1) {
            protected_player_array.splice(i, 1);
          }
          setForwProtected([...protected_player_array]);
        }
      } else if (player.role === 'G') {
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
    const number_protected_player =
      defProtected.length + forwProtected.length + goalProtected.length + reservProtected.length;

    if (number_protected_player === poolInfo.next_season_number_players_protected) {
      const cookie = Cookies.get(`token-${username}`);

      // validate login
      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token: cookie },
        body: JSON.stringify({
          pool_name: poolInfo.name,
          def_protected: defProtected,
          forw_protected: forwProtected,
          goal_protected: goalProtected,
          reserv_protected: reservProtected,
        }),
      };
      fetch('../pool/protect_players', requestOptions)
        .then(response => response.json())
        .then(data => {
          if (data.success === 'False') {
            // props.history.push('/login');
          }
        });
    }
  };

  const render_forward_dynastie = () =>
    poolInfo.context[username].chosen_forward
      .filter(player => {
        if (forwProtected.findIndex(p => p.name === player.name && p.team === player.team) === -1) {
          if (reservProtected.findIndex(p => p.name === player.name && p.team === player.team) === -1) {
            return player;
          }
        }
        return null;
      })
      .map((player, i) => (
        <tr onClick={() => protect_player(player)} key={player.name}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="30" height="30" />
          </td>
        </tr>
      ));

  const render_defender_dynastie = () =>
    poolInfo.context[username].chosen_defender
      .filter(player => {
        if (defProtected.findIndex(p => p.name === player.name && p.team === player.team) === -1) {
          if (reservProtected.findIndex(p => p.name === player.name && p.team === player.team) === -1) {
            return player;
          }
        }
        return null;
      })
      .map((player, i) => (
        <tr onClick={() => protect_player(player)} key={player.name}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="30" height="30" />
          </td>
        </tr>
      ));

  const render_goalies_dynastie = () =>
    poolInfo.context[username].chosen_goalies
      .filter(player => {
        if (goalProtected.findIndex(p => p.name === player.name && p.team === player.team) === -1) {
          if (reservProtected.findIndex(p => p.name === player.name && p.team === player.team) === -1) {
            return player;
          }
        }
        return null;
      })
      .map((player, i) => (
        <tr onClick={() => protect_player(player)} key={player.name}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="30" height="30" />
          </td>
        </tr>
      ));

  const render_reservist_dynastie = () =>
    poolInfo.context[username].chosen_reservist
      .filter(player => {
        if (forwProtected.findIndex(p => p.name === player.name && p.team === player.team) === -1) {
          if (reservProtected.findIndex(p => p.name === player.name && p.team === player.team) === -1) {
            return player;
          }
        }
        return null;
      })
      .map((player, i) => (
        <tr onClick={() => protect_player(player)} key={player.name}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="30" height="30" />
          </td>
        </tr>
      ));

  if (poolInfo && inRoom) {
    const nb_player =
      poolInfo.context[username].nb_defender +
      poolInfo.context[username].nb_forward +
      poolInfo.context[username].nb_goalies +
      poolInfo.context[username].nb_reservist;

    if (nb_player > poolInfo.next_season_number_players_protected) {
      return (
        <div>
          <h1>Protect player for pool: {poolInfo.name}</h1>
          <div className="container">
            <div className="floatLeft">
              <h2>Protect {poolInfo.next_season_number_players_protected} players of your team</h2>
              <table className="content-table">
                <thead>
                  <h3>Forwards</h3>
                  <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                  </tr>
                </thead>
                <tbody>{render_forward_dynastie()}</tbody>
                <thead>
                  <h3>Defenders</h3>
                  <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                  </tr>
                  <tbody>{render_defender_dynastie()}</tbody>
                </thead>
                <thead>
                  <h3>Goalies</h3>
                  <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                  </tr>
                  <tbody>{render_goalies_dynastie()}</tbody>
                </thead>
                <thead>
                  <h3>Reservists</h3>
                  <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                  </tr>
                  <tbody>{render_reservist_dynastie()}</tbody>
                </thead>
              </table>
            </div>
            <div className="floatRight">
              <h2>Protected players</h2>
              <table className="content-table">
                <thead>
                  <h3>Forwards</h3>
                  <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                  </tr>
                </thead>
                <tbody>
                  {forwProtected.map((player, i) => (
                    <tr onClick={() => unprotect_player(player, false)} key={player.name}>
                      <td>{i + 1}</td>
                      <td>{player.name}</td>
                      <td>
                        <img src={logos[player.team]} alt="" width="30" height="30" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <thead>
                  <h3>Defenders</h3>
                  <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                  </tr>
                </thead>
                <tbody>
                  {defProtected.map((player, i) => (
                    <tr onClick={() => unprotect_player(player, false)} key={player.name}>
                      <td>{i + 1}</td>
                      <td>{player.name}</td>
                      <td>
                        <img src={logos[player.team]} alt="" width="30" height="30" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <thead>
                  <h3>Goalies</h3>
                  <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                  </tr>
                </thead>
                <tbody>
                  {goalProtected.map((player, i) => (
                    <tr onClick={() => unprotect_player(player, false)} key={player.name}>
                      <td>{i + 1}</td>
                      <td>{player.name}</td>
                      <td>
                        <img src={logos[player.team]} alt="" width="30" height="30" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <thead>
                  <h3>Reservist</h3>
                  <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>team</th>
                  </tr>
                </thead>
                <tbody>
                  {reservProtected.map((player, i) => (
                    <tr onClick={() => unprotect_player(player, true)} key={player.name}>
                      <td>{i + 1}</td>
                      <td>{player.name}</td>
                      <td>
                        <img src={logos[player.team]} alt="" width="30" height="30" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => send_protected_player()} disabled={false} type="button">
                complete protecting player
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h1>Waiting for other player to protect their player...</h1>
        <ClipLoader color="#fff" loading size={75} />
      </div>
    );
  }

  return (
    <div>
      <h1>trying to fetch pool data info...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

DynastiePool.propTypes = {
  username: PropTypes.string.isRequired,
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
  }).isRequired,
  setPoolInfo: PropTypes.func.isRequired,
  socket: PropTypes.shape({
    emit: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
  }).isRequired,
};
