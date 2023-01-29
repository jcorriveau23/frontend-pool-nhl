import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

// Component
import User from '../user';

export default function PoolItem({ name, owner, user, poolDeleted, setPoolDeleted, DictUsers }) {
  const delete_pool = async () => {
    if (user) {
      // only pass the user if pool is in created status.
      try {
        await axios.post(
          '/api-rust/delete-pool',
          { name },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
          }
        );
        setPoolDeleted(!poolDeleted);
      } catch (e) {
        alert(e.response.data);
      }
    }
  };

  return (
    <table>
      <tbody>
        <tr>
          <td>
            <Link to={`/pools/${name}`} key={name}>
              <li>
                <div>
                  <h1>Pool: {name}</h1>
                  <User id={owner} user={user} DictUsers={DictUsers} />
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
      </tbody>
    </table>
  );
}
