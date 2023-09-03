import React, { useEffect, useState } from 'react';

export default function PoolOptions({
  poolInfo,
  poolSettingsUpdate,
  setPoolSettingsUpdate,
  hasOwnerRights,
  DictUsers,
}) {
  useEffect(() => {}, []);

  const [isDynastie, setIsDynastie] = useState(false);
  // TODO: use a poolInfo.settings.dynasties_settings and poolInfo.settings
  // so that some options would only be available in dynastie type pool.

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

  const update_settings = event => {
    if (event.target.type === 'select-one') {
      const updated_field = {};
      updated_field[event.target.name] = Number(event.target.value);

      setPoolSettingsUpdate(pool => ({ ...pool, ...updated_field }));
    }
  };

  const render_options = (title, setting, min, max) => (
    <tr>
      <td>{title}</td>
      <td>
        <select
          name={setting}
          onChange={update_settings}
          disabled={!hasOwnerRights}
          value={
            poolSettingsUpdate && poolSettingsUpdate[setting] ? poolSettingsUpdate[setting] : poolInfo.settings[setting]
          }
        >
          {create_select_Item(min, max)}
        </select>
      </td>
    </tr>
  );

  const render_dynastie_options = (title, setting, min, max) => (
    <tr>
      <td>{title}</td>
      <td>
        <select
          name={setting}
          onChange={update_settings}
          disabled={!hasOwnerRights}
          value={
            poolSettingsUpdate && poolSettingsUpdate.dynastie_settings && poolSettingsUpdate.dynastie_settings[setting]
              ? poolSettingsUpdate.dynastie_settings[setting]
              : poolInfo.settings.dynastie_settings[setting]
          }
        >
          {create_select_Item(min, max)}
        </select>
      </td>
    </tr>
  );

  const render_assistants_selection = setting => (
    <tr>
      <td>Pool&apos;s assistants:</td>
      <td>
        {poolInfo.participants?.map(id =>
          id === poolInfo.owner ? null : (
            <label htmlFor="date-selection">
              <input type="checkbox" checked={poolInfo.settings.assistants.includes(id)} />
              {DictUsers ? DictUsers[id] : id}
            </label>
          )
        )}
      </td>
    </tr>
  );

  const render_date_modifications = setting => (
    <tr>
      <td>Roster Modification dates:</td>
      <td>
        <ul>
          {poolInfo.settings.roster_modification_date.map(date => (
            <li className="block" key={date}>
              {date}
            </li>
          ))}
        </ul>
      </td>
    </tr>
  );

  return (
    <div className="half-cont">
      <table className="content-table-no-min">
        <tbody>
          <tr>
            <th colSpan={2}>Pool Information</th>
          </tr>
          <tr>
            <td>Pool Name</td>
            <td>{poolInfo.name}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{poolInfo.status}</td>
          </tr>
          <tr>
            <td>Owner</td>
            <td>{DictUsers ? DictUsers[poolInfo.owner] : poolInfo.owner}</td>
          </tr>
          <tr>
            <th colSpan={2}>General Rules</th>
          </tr>
          <tr>
            <td>Number of poolers</td>
            <td>{poolInfo.settings.number_poolers}</td>
          </tr>
          {render_options('Number of forwards:', 'number_forwards', 2, 12)}
          {render_options('Number of defenders:', 'number_defenders', 2, 6)}
          {render_options('Number of goalies:', 'number_goalies', 1, 3)}
          {render_options('Number of reservists:', 'number_reservists', 1, 5)}
          {poolInfo.settings.dynastie_settings || poolSettingsUpdate?.dynastie_settings ? (
            <>
              {render_dynastie_options('Number of tradable draft picks:', 'tradable_picks', 1, 5)}
              {render_dynastie_options(
                'Next season number of player to protected:',
                'next_season_number_players_protected',
                6,
                12
              )}
            </>
          ) : null}

          {render_assistants_selection()}
          {render_date_modifications()}
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
