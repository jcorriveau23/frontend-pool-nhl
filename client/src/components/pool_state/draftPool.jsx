import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';

// Icons
import { BsPenFill } from 'react-icons/bs';

// utils
import { abbrevToTeamId } from '../img/logos';

// components
import PlayerList from './playerList';
import DraftOrder from './draftOrder';
import DrafterTurn from './DrafterTurn';

// css
import '../react-tabs.css';

// images
import SearchPlayersStats from '../stats_page/searchPlayersStats';
import SearchPlayer from '../app/searchPlayer';

export default function DraftPool({
  user,
  DictUsers,
  poolName,
  poolInfo,
  setPoolInfo,
  playersIdToPoolerMap,
  injury,
  userIndex,
}) {
  const [inRoom, setInRoom] = useState(false);
  const [userList, setUserList] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(userIndex === -1 ? 0 : userIndex);
  const [nextDrafter, setNextDrafter] = useState('');

  const create_socket_command = (command, arg) => `{"${command}": ${arg}}`;

  useEffect(() => {
    const socket_tmp = new WebSocket(`wss://${window.location.host}api-rust/ws/${Cookies.get(`token-${user._id}`)}`);

    // Receiving message from the socket server.
    socket_tmp.onmessage = event => {
      try {
        const response = JSON.parse(event.data);
        if (response.Pool) {
          // This is a pool update
          setPoolInfo(response.Pool.pool);
        } else if (response.Users) {
          setUserList(Object.keys(response.Users.room_users).map(key => response.Users.room_users[key]));
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
  }, [user]);

  const draft_player = player => {
    socket.send(create_socket_command('DraftPlayer', `{"player": ${JSON.stringify(player)}}`));
  };

  const undo_draft_player = () => {
    if (window.confirm(`Do you really want to undo the last selection?`)) {
      socket.send('"UndoDraftPlayer"');
    }
  };

  const confirm_selection = player => {
    if (window.confirm(`Do you really want to select ${player.name}?`)) {
      draft_player(player);
    }
  };

  const OnSearchPlayerClicked = async player => {
    let playerPosition = '';

    switch (player.positionCode) {
      case 'G': {
        playerPosition = 'G'; // goalie
        break;
      }
      case 'L':
      case 'C':
      case 'R': {
        playerPosition = 'F'; // forward
        break;
      }
      case 'D': {
        playerPosition = player.positionCode; // defender
        break;
      }
      default: {
        alert(`This player positionCode is not valid ${player.positionCode}!`);
        return;
      }
    }

    confirm_selection({
      id: Number(player.playerId),
      name: player.name,
      team: abbrevToTeamId[player.teamAbbrev] ?? 0,
      position: playerPosition,
    });
  };

  const render_tabs_choice = _nextDrafter => (
    <Tabs forceRenderTabPanel>
      <TabList>
        <Tab>
          <BsPenFill size={30} />
          Draft Order
        </Tab>
        <Tab>Teams</Tab>
      </TabList>
      <TabPanel>
        {user._id === poolInfo.owner ? (
          <button className="base-button" onClick={undo_draft_player} type="button">
            Undo
          </button>
        ) : null}
        <DraftOrder
          poolInfo={poolInfo}
          injury={injury}
          DictUsers={DictUsers}
          setNextDrafter={setNextDrafter}
          user={user}
        />
      </TabPanel>
      <TabPanel>
        <Tabs selectedIndex={selectedTeamIndex} onSelect={index => setSelectedTeamIndex(index)}>
          <TabList>
            {poolInfo.participants.map(participant => (
              <Tab>
                <DrafterTurn nextDrafter={_nextDrafter} participant={participant} user={user} DictUsers={DictUsers} />
              </Tab>
            ))}
          </TabList>
          {poolInfo.participants.map(participant => (
            <TabPanel key={participant}>
              <PlayerList
                poolerContext={poolInfo.context.pooler_roster[participant]}
                players={poolInfo.context.players}
                injury={injury}
              />
            </TabPanel>
          ))}
        </Tabs>
      </TabPanel>
    </Tabs>
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
              <div className="search-players">
                <SearchPlayer OnSearchPlayerClicked={player => OnSearchPlayerClicked(player)} />
              </div>
              <SearchPlayersStats
                injury={injury}
                user={user}
                poolInfo={poolInfo}
                DictUsers={DictUsers}
                playersIdToPoolerMap={playersIdToPoolerMap}
                confirm_selection={confirm_selection}
              />
            </div>
          </div>
          <div className="float-right">
            <div className="half-cont">{render_tabs_choice(nextDrafter)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cont">
      <h1>trying to join the pool draft...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
