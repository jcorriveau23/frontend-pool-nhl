// can only access this page when connected

// if connected on web2 account. give the ability to connect a wallet.

// Gives information related to the account. (address, pools?, bets? )
// gives the ability to the user to edit its username.
// button to logout -> link to the login page if clicking on logout.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

import { AiOutlineEdit } from 'react-icons/ai';

export default function ProfilePage({ user, setUser }) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const logout = () => {
    Cookies.remove(`token-${user._id}`);
    localStorage.clear('persist-account');
    setUser(null);
    navigate('/login');
  };

  const set_username = async () => {
    if (newUsername === '') alert(`The new username provided cannot be empty!`);
    else if (window.confirm(`Are you sure you want to set your new username to be ${newUsername}`)) {
      try {
        const res = await axios.post(
          '/api-rust/user/set-username',
          { new_username: newUsername },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id}`)}` },
          }
        );
        localStorage.setItem('persist-account', JSON.stringify(res.data.user));
        setUser(res.data.user);
        alert("You have successfullly change you're username.");
      } catch (e) {
        alert(e.response.data);
      }
    }
  };

  const set_password = async () => {
    if (newPassword === '') alert(`The password provided cannot be empty!`);
    else if (newPassword !== newPasswordRepeat) alert(`The 2 passwords entered does not match!`);
    else if (window.confirm(`Are you sure you want to change your password?`)) {
      try {
        const res = await axios.post(
          '/api-rust/user/set-password',
          { password: newPassword },
          {
            headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id}`)}` },
          }
        );
        localStorage.setItem('persist-account', JSON.stringify(res.data.user));
        setUser(res.data.user);
        alert("You have successfullly change you're password.");
      } catch (e) {
        alert(e.response.data);
      }
    }
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
        <div className="form-content">
          <form>
            <input
              type="text"
              placeholder={user.name}
              onChange={event => setNewUsername(event.target.value)}
              required
            />
            <form>
              <button className="base-button_no_border" onClick={set_username} type="button">
                <AiOutlineEdit size={30} />
                edit username
              </button>
            </form>
            <input
              type="password"
              placeholder="new password"
              onChange={event => setNewPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="repeat password"
              onChange={event => setNewPasswordRepeat(event.target.value)}
              required
            />
          </form>
          <button className="base-button_no_border" onClick={set_password} type="button">
            <AiOutlineEdit size={30} />
            Change password
          </button>
        </div>
        <div>
          <button className="base-button" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </div>
    );
  }
  return <h1> </h1>;
}
