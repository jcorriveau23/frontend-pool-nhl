import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ClipLoader from 'react-spinners/ClipLoader';

// Icons
import { BsPenFill } from 'react-icons/bs';

// components
import PlayerList from './playerList';
import DraftOrder from './draftOrder';
import DrafterTurn from './DrafterTurn';

// css
import '../react-tabs.css';

// images
import SearchPlayersStats from '../stats_page/searchPlayersStats';
import { abbrevToTeamId } from '../img/logos';

export default function DraftPool({
  user,
  DictUsers,
  poolName,
  poolInfo,
  setPoolInfo,
  playersIdToPoolerMap,
  injury,
  socket,
  userIndex,
}) {
  const [inRoom, setInRoom] = useState(false);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(userIndex === -1 ? 0 : userIndex);
  const [nextDrafter, setNextDrafter] = useState('');

  useEffect(() => {
    if (socket && poolName && user._id) {
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
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('poolInfo', data => {
        setPoolInfo(data);
      });
    }
  }, [socket]);

  const chose_player = player => {
    socket.emit('pickPlayer', Cookies.get(`token-${user._id.$oid}`), poolInfo.name, player, ack => {
      if (ack.success === false) {
        alert(ack.message);
      }
    });
  };

  const undo = () => {
    if (window.confirm(`Do you really want to undo the last selection?`)) {
      socket.emit('undo', Cookies.get(`token-${user._id.$oid}`), poolInfo.name, ack => {
        if (ack.success === false) {
          alert(ack.message);
        }
      });
    }
  };

  const confirm_selection = player => {
    if (window.confirm(`Do you really want to select ${player.name}?`)) {
      chose_player(player);
    }
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
        {user._id.$oid === poolInfo.owner ? (
          <button className="base-button" onClick={undo} type="button">
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
              <PlayerList poolerContext={poolInfo.context.pooler_roster[participant]} injury={injury} />
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
            <h1>{nextDrafter}</h1>
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
