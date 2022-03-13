import React, { useState } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

import { styleModal } from './styleModal';

export default function RegisterModal({ showRegisterModal, setShowRegisterModal }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [msg, setMsg] = useState('');

  const register = () => {
    if (password === repeatPassword) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username,
          email: 'TODO',
          phone: 'TODO',
          password,
        }),
      };
      fetch('https://hockeypool.live/api/auth/register', requestOptions)
        .then(response => response.json())
        .then(data => {
          if (data.success === 'True') {
            setMsg(data.message);
          } else {
            setMsg(data.message);
          }
        });
    } else {
      setMsg('Error, password and repeated password does not correspond!');
    }
  };

  return (
    <Modal style={styleModal} isOpen={showRegisterModal} onRequestClose={() => setShowRegisterModal(false)}>
      <div className="modal_content">
        <h2>Register an account</h2>
        <form>
          <p>Please fill in this form to create an account.</p>
          <input
            type="text"
            placeholder="Enter Username"
            onChange={event => setUsername(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            onChange={event => setPassword(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Repeat Password"
            onChange={event => setRepeatPassword(event.target.value)}
            required
          />
        </form>
        <button onClick={() => register()} disabled={false} type="button">
          Register
        </button>
        <p style={{ color: 'red' }}>{msg}</p>
      </div>
    </Modal>
  );
}

RegisterModal.propTypes = {
  showRegisterModal: PropTypes.bool.isRequired,
  setShowRegisterModal: PropTypes.func.isRequired,
};
