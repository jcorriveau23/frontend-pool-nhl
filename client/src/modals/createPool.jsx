import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

// css
import './modal.css';

export default function CreatePoolModal({ showCreatePoolModal, setShowCreatePoolModal, user }) {
  const [poolNameInput, setPoolNameInput] = useState('');
  const [numberPoolerInput, setNumberPoolerInput] = useState(4);

  const createPool = () => {
    axios
      .post(
        '/api-rust/create-pool',
        { name: poolNameInput, number_pooler: numberPoolerInput },
        {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${user._id.$oid}`)}` },
        }
      )
      .then(res => {
        if (res.data.success) {
          setShowCreatePoolModal(false);
        } else {
          alert(res.data.message);
        }
      })
      .catch(e => {
        alert(e.response.data.error.description);
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
              <select name="number_poolers" onChange={event => setNumberPoolerInput(Number(event.target.value))}>
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
          <button className="base-button" onClick={() => createPool()} disabled={false} type="button">
            Create
          </button>
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
      appElement={document.getElementById('root')}
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
