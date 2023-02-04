// This modals pops up when we want to add a player to a pooler rosters.
// The player goes directly into the reservist.

import React, { useEffect } from 'react';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import axios from 'axios';

// component
import SearchPlayersStats from '../components/stats_page/searchPlayersStats';

// css
import './modal.css';

export default function AddPlayerModal({
  showAddPlayerModal,
  setShowAddPlayerModal,
  participant,
  poolInfo,
  DictUsers,
  setPoolUpdate,
  injury,
  playersIdToPoolerMap,
  user,
}) {
  useEffect(() => {
    console.log('hey');
  }, []);

  const add_player = async player => {
    try {
      await axios.post(
        '/api-rust/add-player',
        {
          name: poolInfo.name,
          user_id: participant,
          player,
        },
        {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
        }
      );
      setPoolUpdate(true);
      setShowAddPlayerModal(false);
    } catch (e) {
      alert(e.response.data);
    }
  };

  const confirm_selection = player => {
    if (window.confirm(`Do you really want to add ${player.name} to ${DictUsers[participant]}' roster?`)) {
      add_player(player);
    }
  };

  return (
    <Modal
      className="big-base-modal"
      overlayClassName="base-overlay"
      isOpen={showAddPlayerModal}
      onRequestClose={() => setShowAddPlayerModal(false)}
      appElement={document.getElementById('root')}
    >
      <div className="modal_content">
        <div className="cont">
          <h1>Select a players your want to add to {DictUsers[participant]}&apos;s roster.</h1>
        </div>
        <div className="cont">
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
    </Modal>
  );
}
