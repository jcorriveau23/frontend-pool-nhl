import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

// css
import './modal.css';

export default function CreatePoolModal({ showCreatePoolModal, setShowCreatePoolModal, user }) {
  const [msg, setMsg] = useState('');
  const [poolNameInput, setPoolNameInput] = useState('');
  const [numberPoolerInput, setNumberPoolerInput] = useState(4);

  const createPool = () => {
    axios
      .post('/api/pool/pool_creation', {
        token: Cookies.get(`token-${user._id}`),
        name: poolNameInput,
        owner: user._id, // TODO change that to use the _id instead of name since the name can be edit by the user.
        number_pooler: numberPoolerInput,
      })
      .then(res => {
        if (res.data.success) {
          setShowCreatePoolModal(false);
        } else {
          setMsg(res.data.message);
        }
      });
  };

  const isLoggedRender = () => {
    if (user) {
      return (
        <div className="modal_content">
          <h1>Create a pool</h1>
          <p>What name do you give to your pool {user.name}?</p>
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
          <button className="base_button" onClick={() => createPool()} disabled={false} type="button">
            Create
          </button>
          <p style={{ color: 'red' }}>{msg}</p>
        </div>
      );
    }

    return (
      <div className="modal_content">
        <p>You need to be logged in to create a pool.</p>
      </div>
    );
  };

  return (
    <Modal
      className="baseModal"
      overlayClassName="baseOverlay"
      isOpen={showCreatePoolModal}
      onRequestClose={() => setShowCreatePoolModal(false)}
    >
      {isLoggedRender()}
    </Modal>
  );
}

CreatePoolModal.propTypes = {
  showCreatePoolModal: PropTypes.bool.isRequired,
  setShowCreatePoolModal: PropTypes.func.isRequired,
  user: PropTypes.shape({ name: PropTypes.string.isRequired, _id: PropTypes.string.isRequired }).isRequired,
};
