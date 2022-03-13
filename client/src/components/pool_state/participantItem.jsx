import React from 'react';
import PropTypes from 'prop-types';

export default function ParticipantItem({ name, ready }) {
  return (
    <div>
      <p>{name}</p>
      <p>{ready ? 'Ready' : 'Not Ready'}</p>
    </div>
  );
}

ParticipantItem.propTypes = { name: PropTypes.string.isRequired, ready: PropTypes.bool.isRequired };
