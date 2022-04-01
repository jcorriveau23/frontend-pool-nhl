import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// components
import ParticipantItem from './participantItem';

export default function CreatedPool({ user, DictUsers, poolName, poolInfo, setPoolInfo, socket }) {
  const [inRoom, setInRoom] = useState(false);
  const [userList, setUserList] = useState([]);
  // const [msg, setMsg] = useState(""); // TODO: add some error msg to display on the app.

  useEffect(() => {
    if (socket && poolName) {
      // TODO: add some validation server socket side to prevent someone joining the pool
      // when there is already the maximum poolers in the room
      socket.emit('joinRoom', Cookies.get(`token-${user._id}`), poolName);
      setInRoom(true);
    }
    return () => {
      if (socket && poolName) {
        socket.emit('leaveRoom', Cookies.get(`token-${user._id}`), poolName);
        socket.off('roomData');
        setInRoom(false);
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('roomData', data => {
        // console.log(data);
        setUserList(data);
      });

      socket.on('poolInfo', data => {
        // console.log(data);
        setPoolInfo(data);
      });
    }
  }, [socket]);

  const handleChange = event => {
    if (event.target.type === 'checkbox') {
      // the host click on the start button
      if (event.target.checked) {
        socket.emit('playerReady', Cookies.get(`token-${user._id}`), poolName);
      } else {
        socket.emit('playerNotReady', Cookies.get(`token-${user._id}`), poolName);
      }
    } else if (event.target.type === 'button') {
      // the host click on the start button
      socket.emit('startDraft', Cookies.get(`token-${user._id}`), poolName);
    } else if (event.target.type === 'select-one') {
      // the host change a value of the pool configuration
      const poolInfoChanged = poolInfo;

      poolInfoChanged[event.target.name] = event.target.value;
      setPoolInfo(poolInfoChanged);
      socket.emit('changeRule', Cookies.get(`token-${user._id}`), poolInfo);
    }
  };

  const render_participants = () => {
    const participants = [];

    for (let i = 0; i < poolInfo.number_poolers; i += 1) {
      if (i < userList.length) {
        participants.push(
          <li key={userList[i]._id}>
            <ParticipantItem name={DictUsers[userList[i]._id]} ready={userList[i].ready} />
          </li>
        ); // TODO: add a modal pop up to add that friend
      } else {
        participants.push(
          <li key={`user not found: ${i}`}>
            <ParticipantItem name="user not found" ready={false} />
          </li>
        );
      }
    }
    return participants;
  };

  const render_start_draft_button = () => {
    let bDisable = false;

    if (userList.length === poolInfo.number_poolers) {
      for (let i = 0; i < poolInfo.number_poolers; i += 1) {
        if (userList[i].ready === false) bDisable = true;
      }
    } else bDisable = true;

    if (user._id === poolInfo.owner) {
      return (
        <button onClick={handleChange} disabled={bDisable} type="button">
          Start draft
        </button>
      );
    }

    return null;
  };

  if (poolInfo && inRoom) {
    return (
      <div className="container">
        <h1>Match Making for Pool {poolName}</h1>
        <div className="floatLeft">
          <h2>Rule: </h2>
          <table>
            <tbody>
              <tr>
                <td>Number of poolers</td>
                <td>
                  <select
                    name="number_poolers"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.number_poolers}
                  >
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                    <option>11</option>
                    <option>12</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Number of forwards:</td>
                <td>
                  <select
                    name="number_forward"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.number_forward}
                  >
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                    <option>11</option>
                    <option>12</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Number of defenders:</td>
                <td>
                  <select
                    name="number_defenders"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.number_defenders}
                  >
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Number of goalies:</td>
                <td>
                  <select
                    name="number_goalies"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.number_goalies}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Number of reservists:</td>
                <td>
                  <select
                    name="number_reservist"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.number_reservist}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <h2>Points</h2>
          <table>
            <tbody>
              <tr>
                <td>pts per goal by forward:</td>
                <td>
                  <select
                    name="forward_pts_goals"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.forward_pts_goals}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per assist by forward:</td>
                <td>
                  <select
                    name="forward_pts_assists"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.forward_pts_assists}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per hat trick by forward:</td>
                <td>
                  <select
                    name="forward_pts_hattricks"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.forward_pts_hattricks}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per goal by defender:</td>
                <td>
                  <select
                    name="defender_pts_goals"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.defender_pts_goals}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per assist by defender:</td>
                <td>
                  <select
                    name="defender_pts_assists"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.defender_pts_assists}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per hat trick by defender:</td>
                <td>
                  <select
                    name="defender_pts_hattricks"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.defender_pts_hattricks}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per win by goalies</td>
                <td>
                  <select
                    name="goalies_pts_wins"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.goalies_pts_wins}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per shutout by goalies</td>
                <td>
                  <select
                    name="goalies_pts_shutouts"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.goalies_pts_shutouts}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per goal by goalies:</td>
                <td>
                  <select
                    name="goalies_pts_goals"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.goalies_pts_goals}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>pts per assist by goalies:</td>
                <td>
                  <select
                    name="goalies_pts_assists"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.goalies_pts_assists}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>next season number player protected:</td>
                <td>
                  <select
                    name="next_season_number_players_protected"
                    onChange={handleChange}
                    disabled={poolInfo.owner !== user._id}
                    value={poolInfo.next_season_number_players_protected}
                  >
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                    <option>11</option>
                    <option>12</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>number tradable draft picks:</td>
                <td>
                  <select name="tradable_picks" onChange={handleChange} disabled={poolInfo.owner !== user._id}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="floatRight">
          <input type="checkbox" onChange={handleChange} />
          <b>Ready?</b>
          {render_start_draft_button()}
          <h2>Participants: </h2>
          <div className="pool_item">
            <ul>{render_participants()}</ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Trying to fetch pool data info...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

CreatedPool.propTypes = {
  user: PropTypes.shape({ _id: PropTypes.string.isRequired }).isRequired,
  poolName: PropTypes.string.isRequired,
  poolInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    forward_pts_goals: PropTypes.number.isRequired,
    forward_pts_assists: PropTypes.number.isRequired,
    forward_pts_hattricks: PropTypes.number.isRequired,
    defender_pts_goals: PropTypes.number.isRequired,
    defender_pts_assists: PropTypes.number.isRequired,
    defender_pts_hattricks: PropTypes.number.isRequired,
    goalies_pts_wins: PropTypes.number.isRequired,
    goalies_pts_shutouts: PropTypes.number.isRequired,
    goalies_pts_goals: PropTypes.number.isRequired,
    goalies_pts_assists: PropTypes.number.isRequired,
    number_poolers: PropTypes.number.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
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
