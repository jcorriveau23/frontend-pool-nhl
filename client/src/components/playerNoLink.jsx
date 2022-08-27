import React from 'react';
import PropTypes from 'prop-types';

import InjuryTooltips from './injuryTooltips';

export default function PlayerNoLink({ name, injury }) {
  return (
    <table width="100%">
      <tbody>
        <tr>
          <td align="middle">
            <b>{name}</b>
          </td>
          <td>
            <InjuryTooltips name={name} injury={injury} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
