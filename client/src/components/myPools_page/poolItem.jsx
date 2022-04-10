import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

export default function PoolItem({ name, owner, user, poolDeleted, setPoolDeleted, DictUsers }) {
  const delete_pool = () => {
    if (user) {
      // only pass the user if pool is in created status.
      axios.post('/api/pool/delete_pool', { token: Cookies.get(`token-${user._id}`), name }).then(res => {
        if (res.data.success) {
          setPoolDeleted(!poolDeleted);
        }
      });
    }
  };

  return (
    <div>
      <p>Pool: {name}</p>
      <p>Owner: {DictUsers ? DictUsers[owner] : owner}</p>
      {user && user._id === owner ? (
        <button className="base-button" onClick={delete_pool} type="button">
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
  poolDeleted: PropTypes.bool.isRequired,
  setPoolDeleted: PropTypes.func.isRequired,
  DictUsers: PropTypes.shape({}).isRequired,
};
