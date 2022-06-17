import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

// icons
import { FaAmbulance } from 'react-icons/fa';

export default function InjuryTooltips({ name, injury }) {
  return injury && injury[name] ? (
    <>
      <p data-tip={`${injury[name].type}, ${injury[name].recovery} `}>
        <FaAmbulance color="#a00" size={30} />
      </p>
      <ReactTooltip padding="8px" />
    </>
  ) : null;
}
