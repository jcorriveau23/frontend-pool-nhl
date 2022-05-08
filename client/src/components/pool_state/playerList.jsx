import React, { useState } from 'react';
import PropTypes from 'prop-types';

// images
import { logos } from '../img/logos';

export default function PlayerList({ poolerContext }) {
  const render_players = players =>
    players.map((player, i) => (
      <tr key={player}>
        <td>{i + 1}</td>
        <td>{player.name}</td>
        <td>
          <img src={logos[player.team]} alt="" width="40" height="40" />
        </td>
      </tr>
    ));

  const render_tabs_choice_headers = position => (
    <>
      <tr>
        <th colSpan={3}>{position}</th>
      </tr>
      <tr>
        <th>#</th>
        <th>name</th>
        <th>team</th>
      </tr>
    </>
  );
  return (
    <>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Forwards')}</thead>
        <tbody>{render_players(poolerContext.chosen_forward)}</tbody>
      </table>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Defenders')}</thead>
        <tbody>{render_players(poolerContext.chosen_defender)}</tbody>
      </table>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Goalies')}</thead>
        <tbody>{render_players(poolerContext.chosen_goalies)}</tbody>
      </table>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Reservists')}</thead>
        <tbody>{render_players(poolerContext.chosen_reservist)}</tbody>
      </table>
    </>
  );
}

PlayerList.propTypes = {};