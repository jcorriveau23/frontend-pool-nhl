import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Component
import User from '../user';

export default function PickList({ tradablePicks, participant, add_pick, side, filterPicks, DictUsers }) {
  const render_pick = rounds =>
    rounds.map((picks, i) =>
      Object.keys(picks)
        .filter(from => {
          if (picks[from] === participant) {
            return filterPicks ? filterPicks.findIndex(pick => pick.round === i && pick.from === from) === -1 : true;
          }
        })
        .map(from => (
          <tr onClick={add_pick ? () => add_pick(side, i, from) : () => null}>
            <td>
              <b>{i + 1}</b>
            </td>
            <td>
              <b style={from === participant ? null : { color: 'red' }}>{DictUsers ? DictUsers[from] : from}</b>
            </td>
          </tr>
        ))
    );

  const render_tab_pick_headers = () => (
    <>
      <tr>
        <th colSpan={3}>{DictUsers ? DictUsers[participant] : participant}&apos;s tradable picks</th>
      </tr>
      <tr>
        <th>Round #</th>
        <th>From</th>
      </tr>
    </>
  );

  if (tradablePicks) {
    return (
      <table className="content-table-no-min">
        <thead>{render_tab_pick_headers()}</thead>
        <tbody>{render_pick(tradablePicks)}</tbody>
      </table>
    );
  }
  return <h1>There is no tradable picks in this pool.</h1>;
}

PickList.propTypes = {};
