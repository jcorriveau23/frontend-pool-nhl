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

import { AiOutlineEdit } from 'react-icons/ai';

export default function ProfilePage({ user, setUser }) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const logout = () => {
    Cookies.remove(`token-${user._id.$oid}`);
    localStorage.clear('persist-account');
    setUser(null);
    navigate('/login');
  };

  const set_username = () => {
    axios
      .post(
        '/api-rust/set-username',
        { new_username: newUsername },
        {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
        }
      )
      .then(res => {
        if (res.data.user) {
          localStorage.setItem('persist-account', JSON.stringify(res.data.user));
          setUser(res.data.user);
          alert("You have successfullly change you're username.");
        } else {
          alert(res.data.message);
        }
      });
  };

  const set_password = () => {
    axios
      .post(
        '/api-rust/set-password',
        { password: newPassword },
        {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
        }
      )
      .then(res => {
        if (res.data.user) {
          localStorage.setItem('persist-account', JSON.stringify(res.data.user));
          setUser(res.data.user);
          alert("You have successfullly change you're password.");
        } else {
          alert(res.data.message);
        }
      });
  };

  if (user) {
    return (
      <div className="cont">
        <table className="content-table">
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
              <th>Email</th>
              <td>{user.email}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <form>
            <input
              type="text"
              placeholder={user.name}
              onChange={event => setNewUsername(event.target.value)}
              required
            />
            <button className="base-button_no_border" onClick={set_username} type="button">
              <AiOutlineEdit size={30} />
              edit username
            </button>
            <input type="password" onChange={event => setNewPassword(event.target.value)} required />
            <button className="base-button_no_border" onClick={set_password} type="button">
              <AiOutlineEdit size={30} />
              Change password
            </button>
          </form>
          <button className="base-button" onClick={logout} type="button">
            Logout
          </button>
        </div>
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
