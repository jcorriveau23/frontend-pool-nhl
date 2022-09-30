import React from 'react';

export default function User({ id, user, DictUsers, parenthesis = false, noColor = false }) {
  if (parenthesis)
    return (
      <b style={id === user?._id.$oid ? { color: '#070' } : noColor ? null : { color: '#a20' }}>
        {DictUsers ? `(${DictUsers[id]})` : id}
      </b>
    );

  return (
    <b style={id === user?._id.$oid ? { color: '#070' } : noColor ? null : { color: '#a20' }}>
      {DictUsers ? DictUsers[id] : id}
    </b>
  );
}
