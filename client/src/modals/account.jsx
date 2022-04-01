// This modal gives information related to the wallet.
// - amount of Eth.
// - quick copy of the wallet adresse.
// - quick log out button.

import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

import { styleModal } from './styleModal';

export default function AccountModal({ user, showAccountModal, setShowAccountModal }) {
  const logout = () => {};

  return (
    <Modal style={styleModal} isOpen={showAccountModal} onRequestClose={() => setShowAccountModal(false)}>
      <h1>Address: {user.addr}</h1>
      <h3>Ethers: </h3>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </Modal>
  );
}

AccountModal.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    addr: PropTypes.string.isRequired,
    pool_list: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
  showAccountModal: PropTypes.string.isRequired,
  setShowAccountModal: PropTypes.func.isRequired,
};
