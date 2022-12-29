import React from 'react';

export default function User({ id, user, DictUsers, parenthesis = false, noColor = false }) {
  const red_color = () => (noColor ? null : { color: '#a20' });

  return parenthesis ? (
    <b style={id === user?._id.$oid ? { color: '#070' } : red_color()}>{DictUsers ? `(${DictUsers[id]})` : id}</b>
  ) : (
    <b style={id === user?._id.$oid ? { color: '#070' } : red_color()}>{DictUsers ? DictUsers[id] : id}</b>
  );
}
