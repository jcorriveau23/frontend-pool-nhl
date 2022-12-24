import React from 'react';
import ReactTooltip from 'react-tooltip';

// icons
import { FaAmbulance } from 'react-icons/fa';

export default function InjuryTooltips({ name, injury }) {
  return injury && injury[name] ? (
    <>
      <a style={{ textAlign: 'right' }} data-tip={`${injury[name].type}, ${injury[name].recovery}`}>
        <FaAmbulance color="#a00" size={30} />
      </a>
      <ReactTooltip className="tooltip" padding="8px" />
    </>
  ) : null;
}
