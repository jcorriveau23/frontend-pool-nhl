import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

export default function PoolItem({ name, owner, user, setPoolDeleted, DictUsers }) {
  const delete_pool = () => {
    if (user) {
      // only pass the user if pool is in created status.
      axios.post('/api/pool/delete_pool', { token: Cookies.get(`token-${user._id}`), name });
      setPoolDeleted(true);
    }
  };

  return (
    <div>
      <p>Pool: {name}</p>
      <p>Owner: {DictUsers[owner]}</p>
      {user && user._id === owner ? (
        <button onClick={delete_pool} type="button">
          Delete
        </button>
      ) : null}
    </div>
  );
}

PoolItem.propTypes = {
  name: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
  user: PropTypes.shape({ name: PropTypes.string.isRequired, _id: PropTypes.string.isRequired }).isRequired,
  setPoolDeleted: PropTypes.func.isRequired,
};
