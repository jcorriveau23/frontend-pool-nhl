import React from 'react';
import PropTypes from 'prop-types';

import InjuryTooltips from './injuryTooltips';

export default function PlayerNoLink({ name, injury }) {
  return (
    <div>
      <b>{name}</b>
      <InjuryTooltips name={name} injury={injury} />
    </div>
  );
}
