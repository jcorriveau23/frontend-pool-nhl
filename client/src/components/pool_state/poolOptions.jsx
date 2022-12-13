import React, { useEffect } from 'react';

export default function PoolOptions({ poolInfo, poolSettingsUpdate, hasOwnerRights, update_settings }) {
  useEffect(() => {}, []);

  const create_select_Item = (min, max) => {
    const items = [];
    for (let i = min; i <= max; i += 1) {
      items.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return items;
  };

  const render_options = (title, setting, min, max) => (
    <tr>
      <td>{title}</td>
      <td>
        <select
          name={setting}
          onChange={update_settings}
          disabled={!hasOwnerRights}
          value={poolSettingsUpdate && poolSettingsUpdate[setting] ? poolSettingsUpdate[setting] : poolInfo[setting]}
        >
          {create_select_Item(min, max)}
        </select>
      </td>
    </tr>
  );

  return (
    <div className="half-cont">
      <table className="content-table-no-min">
        <tbody>
          <tr>
            <th colSpan={2}>Rule</th>
          </tr>
          <tr>
            <td>Number of poolers</td>
            <td>{poolInfo.number_poolers}</td>
          </tr>
          {render_options('Number of forwards:', 'number_forwards', 2, 12)}
          {render_options('Number of defenders:', 'number_defenders', 2, 6)}
          {render_options('Number of goalies:', 'number_goalies', 1, 3)}
          {render_options('Number of reservists:', 'number_reservists', 1, 5)}
          {render_options('number tradable draft picks:', 'tradable_picks', 1, 5)}
          {render_options('next season number player protected:', 'next_season_number_players_protected', 6, 12)}
        </tbody>
      </table>
      <table className="content-table-no-min">
        <tbody>
          <tr>
            <th colSpan={2}>Points</th>
          </tr>
          <tr>
            <th colSpan={2}>forwards</th>
          </tr>
          {render_options('points per goal:', 'forward_pts_goals', 1, 3)}
          {render_options('points per assist:', 'forward_pts_assists', 1, 3)}
          {render_options('points per hat trick:', 'forward_pts_hattricks', 1, 3)}
          {render_options('points per shootout goal:', 'forward_pts_shootout_goals', 1, 3)}
          <tr>
            <th colSpan={2}>Defenders</th>
          </tr>
          {render_options('points per goal:', 'defender_pts_goals', 1, 3)}
          {render_options('points per assist:', 'defender_pts_assists', 1, 3)}
          {render_options('points per hat trick:', 'defender_pts_hattricks', 1, 3)}
          {render_options('points per shootout goal:', 'defender_pts_shootout_goals', 1, 3)}
          <tr>
            <th colSpan={2}>Goalies</th>
          </tr>
          {render_options('points per win:', 'goalies_pts_wins', 1, 3)}
          {render_options('points per overtimes losses:', 'goalies_pts_overtimes', 1, 3)}
          {render_options('points per shutout:', 'goalies_pts_shutouts', 1, 3)}
          {render_options('points per goal:', 'goalies_pts_goals', 1, 5)}
          {render_options('points per assist:', 'goalies_pts_assists', 1, 3)}
        </tbody>
      </table>
    </div>
  );
}
