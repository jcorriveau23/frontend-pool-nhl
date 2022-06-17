import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

export default function PoolItem({ name, owner, user, poolDeleted, setPoolDeleted, DictUsers }) {
  const delete_pool = () => {
    if (user) {
      // only pass the user if pool is in created status.
      axios
        .post(
          '/api-rust/delete-pool',
          { name },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
          }
        )
        .then(res => {
          console.log(res);
          if (res.status === 200) {
            setPoolDeleted(!poolDeleted);
          }
        })
        .catch(e => {
          console.log(e.response);
        });
    }
  };

  return (
    <div>
      <p>Pool: {name}</p>
      <p>Owner: {DictUsers ? DictUsers[owner] : owner}</p>
      {user && user._id.$oid === owner ? (
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
