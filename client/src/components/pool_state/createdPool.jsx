import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// components
import ParticipantItem from './participantItem';
import PoolOptions from './poolOptions';

export default function CreatedPool({ user, hasOwnerRights, DictUsers, poolName, poolInfo, setPoolInfo, socket }) {
  const [inRoom, setInRoom] = useState(false);
  const [userList, setUserList] = useState([]);
  // const [msg, setMsg] = useState(""); // TODO: add some error msg to display on the app.

  useEffect(() => {
    if (socket && poolName) {
      // TODO: add some validation server socket side to prevent someone joining the pool
      // when there is already the maximum poolers in the room
      socket.emit('joinRoom', Cookies.get(`token-${user._id.$oid}`), poolName);
      setInRoom(true);
    }
    return () => {
      if (socket && poolName) {
        socket.emit('leaveRoom', Cookies.get(`token-${user._id.$oid}`), poolName);
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

  const update_settings = event => {
    if (event.target.type === 'checkbox') {
      // the host click on the start button
      if (event.target.checked) {
        socket.emit('playerReady', Cookies.get(`token-${user._id.$oid}`), poolName);
      } else {
        socket.emit('playerNotReady', Cookies.get(`token-${user._id.$oid}`), poolName);
      }
    } else if (event.target.type === 'button') {
      // the host click on the start button
      socket.emit('startDraft', Cookies.get(`token-${user._id.$oid}`), poolInfo);
    } else if (event.target.type === 'select-one') {
      // the host change a value of the pool configuration
      const poolInfoChanged = poolInfo;

      poolInfoChanged[event.target.name] = Number(event.target.value);

      socket.emit('changeRule', Cookies.get(`token-${user._id.$oid}`), poolInfoChanged);
    }
  };

  const render_participants = () => {
    const participants = [];

    for (let i = 0; i < poolInfo.number_poolers; i += 1) {
      if (i < userList.length) {
        participants.push(
          <li key={userList[i]._oid}>
            <ParticipantItem id={userList[i]._oid} user={user} DictUsers={DictUsers} ready={userList[i].ready} />
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

    if (user._id.$oid === poolInfo.owner) {
      return (
        <button className="base-button" onClick={update_settings} disabled={bDisable} type="button">
          Start draft
        </button>
      );
    }

    return null;
  };

  if (inRoom) {
    return (
      <div className="min-width">
        <h1>Match Making for Pool {poolName}</h1>
        <div className="float-left">
          <PoolOptions poolInfo={poolInfo} hasOwnerRights={hasOwnerRights} update_settings={update_settings} />
        </div>
        <div className="float-right">
          <div className="half-cont">
            <input type="checkbox" onChange={update_settings} />
            <b>Ready?</b>
            {render_start_draft_button()}
            <h2>Participants: </h2>
            <div className="pool_item">
              <ul>{render_participants()}</ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cont">
      <h1>Trying to join the room...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

CreatedPool.propTypes = {
  user: PropTypes.shape({ _id: PropTypes.string.isRequired }).isRequired,
  DictUsers: PropTypes.shape({}).isRequired,
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
    number_forwards: PropTypes.number.isRequired,
    number_defenders: PropTypes.number.isRequired,
    number_goalies: PropTypes.number.isRequired,
    number_reservists: PropTypes.number.isRequired,
    next_drafter: PropTypes.string.isRequired,
  }).isRequired,
  setPoolInfo: PropTypes.func.isRequired,
  socket: PropTypes.shape({
    emit: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    off: PropTypes.func.isRequired,
  }).isRequired,
};
