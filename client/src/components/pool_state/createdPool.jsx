import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ClipLoader from 'react-spinners/ClipLoader';

// components
import ParticipantItem from './participantItem';
import PoolOptions from './poolOptions';

export default function CreatedPool({
  user,
  hasOwnerRights,
  DictUsers,
  setDictUsers,
  poolName,
  poolInfo,
  setPoolInfo,
}) {
  const [inRoom, setInRoom] = useState(false);
  const [userList, setUserList] = useState([]);
  const [socket, setSocket] = useState(null);
  const [poolSettingsUpdate, setPoolSettingsUpdate] = useState(null);

  const create_socket_command = (command, arg) => `{"${command}": ${arg}}`;

  useEffect(() => {
    const socket_tmp = new WebSocket(`wss://${window.location.host}/api-rust/ws/${Cookies.get(`token-${user._id}`)}`);

    // Receiving message from the socket server.
    socket_tmp.onmessage = event => {
      try {
        const response = JSON.parse(event.data);
        if (response.Pool) {
          // This is a pool update
          setPoolInfo(response.Pool.pool);
          setPoolSettingsUpdate(null);
        } else if (response.Users) {
          setUserList(Object.keys(response.Users.room_users).map(key => response.Users.room_users[key]));
          const DictUsersTmp = {};
          Object.keys(response.Users.room_users).forEach(id => {
            DictUsersTmp[id] = response.Users.room_users[id].name;
          });
          setDictUsers(DictUsersTmp);
        }
      } catch (e) {
        alert(event.data);
      }
    };

    socket_tmp.onopen = () => socket_tmp.send(create_socket_command('JoinRoom', `{"pool_name": "${poolName}"}`));

    setSocket(socket_tmp);
    setInRoom(true);

    return () => {
      socket_tmp.send('"LeaveRoom"');
      socket_tmp.close();
    };
  }, []);

  const update_pool_settings = () => {
    const newPoolSettings = { ...poolInfo.settings, ...poolSettingsUpdate };
    console.log(newPoolSettings);
    socket.send(create_socket_command('OnPoolSettingChanges', `{"pool_settings": ${JSON.stringify(newPoolSettings)}}`));
  };

  const on_ready = () => {
    socket.send('"OnReady"');
  };

  const start_draft = () => {
    socket.send('"StartDraft"');
  };

  const render_participants = () => {
    const participants = [];

    for (let i = 0; i < poolInfo.number_poolers; i += 1) {
      if (i < userList.length) {
        participants.push(
          <li key={userList[i]._id}>
            <ParticipantItem id={userList[i]._id} user={user} DictUsers={DictUsers} ready={userList[i].is_ready} />
          </li>
        );
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
        if (userList[i].is_ready === false) bDisable = true;
      }
    } else bDisable = true;

    if (user._id === poolInfo.owner) {
      return (
        <button className="base-button" onClick={start_draft} disabled={bDisable} type="button">
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
          <button
            className="base-button"
            type="button"
            disabled={!poolSettingsUpdate}
            onClick={() => update_pool_settings()}
          >
            Update Settings
          </button>
          <PoolOptions
            poolInfo={poolInfo}
            poolSettingsUpdate={poolSettingsUpdate}
            setPoolSettingsUpdate={setPoolSettingsUpdate}
            hasOwnerRights={hasOwnerRights}
            DictUsers={DictUsers}
          />
        </div>
        <div className="float-right">
          <div className="half-cont">
            <input type="checkbox" onChange={on_ready} />
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
