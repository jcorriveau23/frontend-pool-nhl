import React, { useState } from 'react';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

import { styleModal } from './styleModal';

export default function CreatePoolModal({ showCreatePoolModal, setShowCreatePoolModal, username }) {
  const [msg, setMsg] = useState('');
  const [poolNameInput, setPoolNameInput] = useState('');
  const [numberPoolerInput, setNumberPoolerInput] = useState(4);

  const createPool = () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: Cookies.get(`token-${username}`),
      },
      body: JSON.stringify({
        name: poolNameInput,
        owner: username,
        number_pooler: numberPoolerInput,
      }),
    };
    fetch('pool/pool_creation', requestOptions)
      .then(response => response.json())
      .then(data => {
        if (data.success === 'True') {
          setShowCreatePoolModal(false);
        } else {
          setMsg(data.message);
        }
      });
  };

  const isLoggedRender = () => {
    if (username) {
      return (
        <div className="modal_content">
          <h1>Create a pool</h1>
          <p>What name do you give to your pool {username}?</p>
          <form>
            <div>
              <input
                type="text"
                placeholder="pool name"
                name="pool_name"
                onChange={event => setPoolNameInput(event.target.value)}
                required
              />
            </div>
            <div>
              <b>number of poolers: </b>
              <select name="number_poolers" onChange={event => setNumberPoolerInput(event.target.value)}>
                <option>2</option>
                <option>3</option>
                <option selected>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
              </select>
            </div>
          </form>
          <button onClick={() => createPool()} disabled={false} type="button">
            Create
          </button>
          <p style={{ color: 'red' }}>{msg}</p>
        </div>
      );
    }

    return (
      <div className="modal_content">
        <h1>{username}</h1>
        <p>You need to be logged in to create a pool.</p>
      </div>
    );
  };

  return (
    <Modal style={styleModal} isOpen={showCreatePoolModal} onRequestClose={() => setShowCreatePoolModal(false)}>
      {isLoggedRender()}
    </Modal>
  );
}

CreatePoolModal.propTypes = {
  showCreatePoolModal: PropTypes.bool.isRequired,
  setShowCreatePoolModal: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};
