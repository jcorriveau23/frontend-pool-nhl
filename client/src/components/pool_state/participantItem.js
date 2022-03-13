import React from 'react';

export default function ParticipantItem({ name, ready }) {
  <div>
    <p>{name}</p>
    <p>{ready ? 'Ready' : 'Not Ready'}</p>
  </div>;
}
