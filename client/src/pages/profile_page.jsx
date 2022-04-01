// can only access this page when connected

// if connected on web2 account. give the ability to connect a wallet.

// Gives information related to the account. (address, pools?, bets? )
// gives the ability to the user to edit its username.
// button to logout -> link to the login page if clicking on logout.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

export default function ProfilePage({ user, setUser }) {
  const [newUsername, setNewUsername] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, []);

  const logout = () => {
    Cookies.remove(`token-${user._id}`);
    localStorage.clear('persist-account');
    window.location.reload(true);
  };

  const set_username = () => {
    axios.post('/api/auth/set_username', { token: Cookies.get(`token-${user._id}`), newUsername }).then(res => {
      if (res.data.success === 'True') {
        Cookies.set(`token-${res.data.user._id}`, res.data.token);
        localStorage.setItem('persist-account', JSON.stringify(res.data.user));
        setUser(res.data.user);
      } else {
        setMsg(res.data.message);
      }
    });
  };

  if (user) {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Username</th>
              <td>{user.name}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td>{user.addr}</td>
            </tr>
            <tr>
              <th>Email:</th>
              <td>{user.email}</td>
            </tr>
          </tbody>
        </table>
        <button onClick={logout} type="button">
          Logout
        </button>
        <form>
          <input type="text" placeholder={user.name} onChange={event => setNewUsername(event.target.value)} required />
          <button onClick={set_username} type="button">
            edit username
          </button>
        </form>
      </div>
    );
  }
  return <h1> </h1>;
}

ProfilePage.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    addr: PropTypes.string.isRequired,
    pool_list: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
  setUser: PropTypes.func.isRequired,
};
