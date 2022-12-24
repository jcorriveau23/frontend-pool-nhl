import React from 'react';

import InjuryTooltips from './injuryTooltips';

export default function PlayerNoLink({ name, injury }) {
  return (
    <>
      <b style={{ paddingRight: '5%' }}>{name}</b>
      <InjuryTooltips name={name} injury={injury} />
    </>
  );
}
