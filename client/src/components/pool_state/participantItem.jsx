import React from 'react';
import PropTypes from 'prop-types';

// Component
import User from '../user';

export default function ParticipantItem({ id, user, DictUsers, ready }) {
  return (
    <table>
      <tr>
        <td>
          <User id={id} user={user} DictUsers={DictUsers} />
        </td>
      </tr>
      <tr>
        <td>
          <p>{ready ? 'Ready' : 'Not Ready'}</p>
        </td>
      </tr>
    </table>
  );
}

ParticipantItem.propTypes = { name: PropTypes.string.isRequired, ready: PropTypes.bool.isRequired };
