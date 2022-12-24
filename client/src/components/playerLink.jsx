import React from 'react';
import { Link } from 'react-router-dom';

import InjuryTooltips from './injuryTooltips';

export default function PlayerLink({ name, id, injury, number }) {
  return (
    <>
      <Link
        to={`/player-info/${id}`}
        style={{
          textDecoration: 'none',
          color: '#000099',
          paddingRight: '5%',
        }}
      >
        {name} {number ? `(${number})` : null}
      </Link>
      <InjuryTooltips name={name} injury={injury} />
    </>
  );
}
