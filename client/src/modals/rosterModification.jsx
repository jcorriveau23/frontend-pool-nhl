// This modals pop up to fill an empty spot with a reservist.
// It will call fill_spot post method to chose from the user reservist to fill an empty spot.

import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import Cookies from 'js-cookie';

// Components
import PlayerNoLink from '../components/playerNoLink';

// images
import { logos } from '../components/img/logos';

// css
import './modal.css';

export default function RosterModificationModal({
  showRosterModificationModal,
  setShowRosterModificationModal,
  poolInfo,
  setPoolUpdate,
  injury,
  user,
}) {
  const [forwSelected, setForwSelected] = useState(poolInfo.context.pooler_roster[user._id.$oid].chosen_forwards);
  const [defSelected, setDefSelected] = useState(poolInfo.context.pooler_roster[user._id.$oid].chosen_defenders);
  const [goalSelected, setGoalSelected] = useState(poolInfo.context.pooler_roster[user._id.$oid].chosen_goalies);
  const [reservSelected, setReservSelected] = useState(poolInfo.context.pooler_roster[user._id.$oid].chosen_reservists);

  const reset_selection = closeModal => {
    setForwSelected(poolInfo.context.pooler_roster[user._id.$oid].chosen_forwards);
    setDefSelected(poolInfo.context.pooler_roster[user._id.$oid].chosen_defenders);
    setGoalSelected(poolInfo.context.pooler_roster[user._id.$oid].chosen_goalies);
    setReservSelected(poolInfo.context.pooler_roster[user._id.$oid].chosen_reservists);
    if (closeModal) setShowRosterModificationModal(false);
  };

  const modify_roster = () => {
    if (window.confirm(`Do you really want to apply this roster modification?`)) {
      axios
        .post(
          '/api-rust/modify-roster',
          {
            name: poolInfo.name,
            forw_protected: forwSelected,
            def_protected: defSelected,
            goal_protected: goalSelected,
            reserv_protected: reservSelected,
          },
          { headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` } }
        )
        .then(res => {
          if (res.data.success) {
            setPoolUpdate(true);
            setShowRosterModificationModal(false);
            alert('You have successfully modify your roster.');
          } else {
            alert(res.data.message);
          }
        });
    }
  };

  const add_player = player => {
    switch (player.position) {
      case 'F': {
        if (forwSelected.length >= poolInfo.number_forwards) {
          alert('The limit of forwards is already reached.');
        } else {
          setForwSelected(prev => [...prev, player]);
          setReservSelected(reservSelected.filter(p => p.id !== player.id));
        }
        break;
      }
      case 'D': {
        if (defSelected.length >= poolInfo.number_defenders) {
          alert('The limit of defenders is already reached.');
        } else {
          setDefSelected(prev => [...prev, player]);
          setReservSelected(reservSelected.filter(p => p.id !== player.id));
        }
        break;
      }
      case 'G': {
        if (goalSelected.length >= poolInfo.number_goalies) {
          alert('The limit of goalies is already reached.');
        } else {
          setGoalSelected(prev => [...prev, player]);
          setReservSelected(reservSelected.filter(p => p.id !== player.id));
        }
        break;
      }
      default:
        break;
    }
  };

  const remove_player = player => {
    setReservSelected(prev => [...prev, player]);

    switch (player.position) {
      case 'F': {
        setForwSelected(forwSelected.filter(p => p.id !== player.id));
        break;
      }
      case 'D': {
        setDefSelected(defSelected.filter(p => p.id !== player.id));
        break;
      }
      case 'G': {
        setGoalSelected(goalSelected.filter(p => p.id !== player.id));
        break;
      }
      default:
        break;
    }
  };

  const render_players = (players, isReservist) =>
    players.map((player, i) => (
      <tr onClick={() => (isReservist ? add_player(player) : remove_player(player))} key={player}>
        <td>{i + 1}</td>
        <td>{player.position}</td>
        <PlayerNoLink name={player.name} injury={injury} />
        <td>
          <img src={logos[player.team]} alt="" width="40" height="40" />
        </td>
      </tr>
    ));

  const render_tabs_choice_headers = (position, count_position, allowed_count_position) => (
    <>
      <tr>
        <th colSpan={4}>
          {position} ({count_position}/{allowed_count_position})
        </th>
      </tr>
      <tr>
        <th>#</th>
        <th>Position</th>
        <th>name</th>
        <th>team</th>
      </tr>
    </>
  );

  return (
    <Modal
      className="big-base-modal"
      overlayClassName="base-overlay"
      isOpen={showRosterModificationModal}
      onRequestClose={() => reset_selection(true)}
      appElement={document.getElementById('root')}
    >
      <div className="modal_content">
        <div className="half-cont">
          <h1>Modify your roster.</h1>
          <button onClick={modify_roster} type="button" className="base-button">
            Send modification
          </button>
        </div>
        <div className="float-left">
          <div className="half-cont">
            <table className="content-table-no-min">
              <thead>{render_tabs_choice_headers('Forwards', forwSelected.length, poolInfo.number_forwards)}</thead>
              <tbody>{render_players(forwSelected, false)}</tbody>
            </table>
            <table className="content-table-no-min">
              <thead>{render_tabs_choice_headers('Defenders', defSelected.length, poolInfo.number_defenders)}</thead>
              <tbody>{render_players(defSelected, false)}</tbody>
            </table>
            <table className="content-table-no-min">
              <thead>{render_tabs_choice_headers('Goalies', goalSelected.length, poolInfo.number_goalies)}</thead>
              <tbody>{render_players(goalSelected, false)}</tbody>
            </table>
          </div>
        </div>
        <div className="float-right">
          <div className="half-cont">
            <table className="content-table-no-min">
              <thead>
                {render_tabs_choice_headers('Reservists', reservSelected.length, poolInfo.number_reservists)}
              </thead>
              <tbody>{render_players(reservSelected, true)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

RosterModificationModal.propTypes = {};