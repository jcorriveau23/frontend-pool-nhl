import React from 'react';

function ParticipantItem({ name, ready }) {
  <div>
    <p>{name}</p>
    <p>{ready ? 'Ready' : 'Not Ready'}</p>
  </div>;
}

export default ParticipantItem;
