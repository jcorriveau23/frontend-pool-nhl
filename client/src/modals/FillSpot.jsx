// This modals pop up to fill an empty spot with a reservist.
// It will call fill_spot post method to chose from the user reservist to fill an empty spot.

import React from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import Cookies from 'js-cookie';

// images
import { team_info } from '../components/img/logos';

// css
import './modal.css';

export default function FillSpotModal({
  showFillSpotModal,
  setShowFillSpotModal,
  poolInfo,
  setPoolUpdate,
  user,
  fillSpotPosition,
}) {
  const fill_spot = async player => {
    if (window.confirm(`Do you really chose ${player.name} to fill the empty spot?`)) {
      try {
        await axios.post(
          '/api-rust/fill-spot',
          { player, name: poolInfo.name },
          { headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` } }
        );
        setShowFillSpotModal(false);
        setPoolUpdate(true);
      } catch (e) {
        alert(e.response.data);
      }
    }
  };

  const render_players = players =>
    players
      .filter(player => player.position === fillSpotPosition)
      .map((player, i) => (
        <tr onClick={() => fill_spot(player)} key={player}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={team_info[player.team].logo} alt="" width="40" height="40" />
          </td>
        </tr>
      ));

  const render_tabs_choice_headers = () => (
    <>
      <tr>
        <th colSpan={3}>{fillSpotPosition}</th>
      </tr>
      <tr>
        <th>#</th>
        <th>name</th>
        <th>team</th>
      </tr>
    </>
  );

  return (
    <Modal
      className="base-modal"
      overlayClassName="base-overlay"
      isOpen={showFillSpotModal}
      onRequestClose={() => setShowFillSpotModal(false)}
      appElement={document.getElementById('root')}
    >
      <div className="modal_content">
        <h1>Select the player you want to add to your roster to fill the empty spot.</h1>
      </div>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Reservists')}</thead>
        <tbody>{render_players(poolInfo.context.pooler_roster[user?._id.$oid].chosen_reservists)}</tbody>
      </table>
    </Modal>
  );
}
