import React from 'react';
import { Link } from 'react-router-dom';

import InjuryTooltips from './injuryTooltips';

export default function PlayerLink({ name, id, injury, number, isLink = true }) {
  return (
    <table width="100%">
      <tbody>
        <tr>
          <td align="middle">
            {isLink ? (
              <Link to={`/player-info/${id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                {name} {number ? `(${number})` : null}
              </Link>
            ) : (
              <b>
                {name} {number ? `(${number})` : null}
              </b>
            )}
          </td>
          <td>
            <InjuryTooltips name={name} injury={injury} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
