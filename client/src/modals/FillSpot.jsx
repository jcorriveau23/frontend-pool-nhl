// This modals pop up to fill an empty spot with a reservist.
// It will call fill_spot post method to chose from the user reservist to fill an empty spot.

import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookies from 'js-cookie';

// images
import { logos } from '../components/img/logos';

// css
import './modal.css';

export default function FillSpot({
  showFillSpotModal,
  setShowFillSpotModal,
  poolInfo,
  setPoolInfo,
  user,
  fillSpotPosition,
}) {
  const fill_spot = player => {
    axios
      .post('/api/pool/fill_spot', { token: Cookies.get(`token-${user._id}`), player, name: poolInfo.name })
      .then(res => {
        if (res.data.success) {
          setShowFillSpotModal(false);
          setPoolInfo(res.data.message);
        } else {
          alert(res.data.message);
        }
      });
  };

  const render_players = players =>
    players
      .filter(player => player.position === fillSpotPosition)
      .map((player, i) => (
        <tr onClick={() => fill_spot(player)} key={player}>
          <td>{i + 1}</td>
          <td>{player.name}</td>
          <td>
            <img src={logos[player.team]} alt="" width="40" height="40" />
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
      className="baseModal"
      overlayClassName="baseOverlay"
      isOpen={showFillSpotModal}
      onRequestClose={() => setShowFillSpotModal(false)}
      appElement={document.getElementById('root')}
    >
      <div className="modal_content">
        <h1>Select the player you want to add to your roster to fill the empty spot.</h1>
      </div>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Reservists')}</thead>
        <tbody>{render_players(poolInfo.context[user._id].chosen_reservist)}</tbody>
      </table>
    </Modal>
  );
}

FillSpot.propTypes = {};