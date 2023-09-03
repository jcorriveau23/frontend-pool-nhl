import React from 'react';

// component
import PlayerNoLink from '../playerNoLink';

// images
import { team_info } from '../img/logos';

export default function PlayerList({ poolerContext, players, injury }) {
  const render_players = player_ids =>
    player_ids.map((player_id, i) => (
      <tr key={player_id}>
        <td>{i + 1}</td>
        <td>
          <PlayerNoLink name={players[player_id].name} injury={injury} />
        </td>
        <td>
          <img src={team_info[players[player_id].team]?.logo} alt="" width="40" height="40" />
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
        <tbody>{render_players(poolerContext.chosen_forwards)}</tbody>
      </table>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Defenders')}</thead>
        <tbody>{render_players(poolerContext.chosen_defenders)}</tbody>
      </table>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Goalies')}</thead>
        <tbody>{render_players(poolerContext.chosen_goalies)}</tbody>
      </table>
      <table className="content-table-no-min">
        <thead>{render_tabs_choice_headers('Reservists')}</thead>
        <tbody>{render_players(poolerContext.chosen_reservists)}</tbody>
      </table>
    </>
  );
}
