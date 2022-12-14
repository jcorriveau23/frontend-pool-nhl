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
            <th colSpan={2}>General Rules</th>
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
            <th colSpan={2}>Points for forwards</th>
          </tr>
          {render_options('Goal:', 'forward_pts_goals', 1, 3)}
          {render_options('Assist', 'forward_pts_assists', 1, 3)}
          {render_options('Hat Trick:', 'forward_pts_hattricks', 1, 3)}
          {render_options('Shootout Goal:', 'forward_pts_shootout_goals', 1, 3)}
          <tr>
            <th colSpan={2}>Points for Defenders</th>
          </tr>
          {render_options('Goal:', 'defender_pts_goals', 1, 3)}
          {render_options('Assist:', 'defender_pts_assists', 1, 3)}
          {render_options('Hat Trick:', 'defender_pts_hattricks', 1, 3)}
          {render_options('Shootout Goal:', 'defender_pts_shootout_goals', 1, 3)}
          <tr>
            <th colSpan={2}>Points for Goalies</th>
          </tr>
          {render_options('Win:', 'goalies_pts_wins', 1, 3)}
          {render_options('Overtimes Loss:', 'goalies_pts_overtimes', 1, 3)}
          {render_options('Shutout:', 'goalies_pts_shutouts', 1, 3)}
          {render_options('Goal:', 'goalies_pts_goals', 1, 5)}
          {render_options('Assist:', 'goalies_pts_assists', 1, 3)}
        </tbody>
      </table>
    </div>
  );
}
