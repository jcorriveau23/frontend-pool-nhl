import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import InjuryTooltips from './injuryTooltips';

export default function PlayerLink({ name, id, injury, number }) {
  return (
    <table width="100%">
      <tbody>
        <tr>
          <td align="middle">
            <Link to={`/player-info/${id}`} style={{ textDecoration: 'none', color: '#000099' }}>
              {name} {number ? `(${number})` : null}
            </Link>
          </td>
          <td>
            <InjuryTooltips name={name} injury={injury} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
