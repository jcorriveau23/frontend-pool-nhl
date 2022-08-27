import React from 'react';
import { Link } from 'react-router-dom';
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
          if (res.data.success) {
            setPoolDeleted(!poolDeleted);
          } else {
            alert(res.data.message);
          }
        })
        .catch(e => {
          console.log(e.response);
        });
    }
  };

  return (
    <tr>
      <td>
        <Link to={`/my-pools/${name}`} key={name}>
          <li>
            <div>
              <h1>Pool: {name}</h1>
              <h2>Owner: {DictUsers ? DictUsers[owner] : owner}</h2>
            </div>
          </li>
        </Link>
      </td>
      <td>
        {user && user._id.$oid === owner ? (
          <button className="base-button" onClick={delete_pool} type="button">
            Delete
          </button>
        ) : null}
      </td>
    </tr>
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
