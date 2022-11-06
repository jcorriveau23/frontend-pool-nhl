import React from 'react';

import InjuryTooltips from './injuryTooltips';

export default function PlayerNoLink({ name, injury }) {
  return (
    <div>
      <b>{name}</b>
      <InjuryTooltips name={name} injury={injury} />
    </div>
  );
}
