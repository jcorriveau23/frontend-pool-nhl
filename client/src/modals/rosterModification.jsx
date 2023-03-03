// This modals pop up to fill an empty spot with a reservist.
// It will call fill_spot post method to chose from the user reservist to fill an empty spot.

import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import Cookies from 'js-cookie';

// Components
import PlayerNoLink from '../components/playerNoLink';

// images
import { team_info } from '../components/img/logos';

// css
import './modal.css';

export default function RosterModificationModal({
  showRosterModificationModal,
  setShowRosterModificationModal,
  poolInfo,
  userModified,
  setPoolUpdate,
  injury,
  user,
}) {
  const [forwSelected, setForwSelected] = useState(poolInfo.context.pooler_roster[userModified].chosen_forwards);
  const [defSelected, setDefSelected] = useState(poolInfo.context.pooler_roster[userModified].chosen_defenders);
  const [goalSelected, setGoalSelected] = useState(poolInfo.context.pooler_roster[userModified].chosen_goalies);
  const [reservSelected, setReservSelected] = useState(poolInfo.context.pooler_roster[userModified].chosen_reservists);

  const reset_selection = closeModal => {
    setForwSelected(poolInfo.context.pooler_roster[userModified].chosen_forwards);
    setDefSelected(poolInfo.context.pooler_roster[userModified].chosen_defenders);
    setGoalSelected(poolInfo.context.pooler_roster[userModified].chosen_goalies);
    setReservSelected(poolInfo.context.pooler_roster[userModified].chosen_reservists);
    if (closeModal) setShowRosterModificationModal(false);
  };

  useEffect(() => {
    reset_selection(false);
  }, [userModified]);

  const modify_roster = async () => {
    if (window.confirm(`Do you really want to apply this roster modification?`)) {
      try {
        await axios.post(
          '/api-rust/modify-roster',
          {
            name: poolInfo.name,
            user_id: userModified,
            forw_list: forwSelected,
            def_list: defSelected,
            goal_list: goalSelected,
            reserv_list: reservSelected,
          },
          { headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` } }
        );
        setPoolUpdate(true);
        setShowRosterModificationModal(false);
        alert('You have successfully modify the roster.');
      } catch (e) {
        alert(e.response.data);
      }
    }
  };

  const add_player = player => {
    switch (player.position) {
      case 'F': {
        if (forwSelected.length >= poolInfo.number_forwards) {
          alert('The limit of forwards is already reached.');
        } else {
          setForwSelected(prev => [...prev, player.id]);
          setReservSelected(reservSelected.filter(p => p !== player.id));
        }
        break;
      }
      case 'D': {
        if (defSelected.length >= poolInfo.number_defenders) {
          alert('The limit of defenders is already reached.');
        } else {
          setDefSelected(prev => [...prev, player.id]);
          setReservSelected(reservSelected.filter(p => p !== player.id));
        }
        break;
      }
      case 'G': {
        if (goalSelected.length >= poolInfo.number_goalies) {
          alert('The limit of goalies is already reached.');
        } else {
          setGoalSelected(prev => [...prev, player.id]);
          setReservSelected(reservSelected.filter(p => p !== player.id));
        }
        break;
      }
      default:
        break;
    }
  };

  const remove_player = player => {
    setReservSelected(prev => [...prev, player.id]);

    switch (player.position) {
      case 'F': {
        setForwSelected(forwSelected.filter(p => p !== player.id));
        break;
      }
      case 'D': {
        setDefSelected(defSelected.filter(p => p !== player.id));
        break;
      }
      case 'G': {
        setGoalSelected(goalSelected.filter(p => p !== player.id));
        break;
      }
      default:
        break;
    }
  };

  const render_players = (players, isReservist) => {
    console.log(players);
    return players.map((playerId, i) => (
      <tr
        onClick={() =>
          isReservist
            ? add_player(poolInfo.context.players[playerId])
            : remove_player(poolInfo.context.players[playerId])
        }
        key={playerId}
      >
        <td>{i + 1}</td>
        <td>{poolInfo.context.players[playerId].position}</td>
        <PlayerNoLink name={poolInfo.context.players[playerId].name} injury={injury} />
        <td>
          <img src={team_info[poolInfo.context.players[playerId].team]?.logo} alt="" width="40" height="40" />
        </td>
      </tr>
    ));
  };

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
