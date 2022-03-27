// This modals pops up when the detected wallet is not connected on the Kovan Network.
// It then prevent the user from doing anything on the web site.
// A button gives a quick access to the user to automaticly switch Network.

import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

import { styleModal } from './styleModal';

export default function WrongNetworkModal({ isWalletConnected, isWrongNetwork }) {
  const switchChain = () => {
    // reload the page to avoid any errors with chain change mid use of application

    window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2A' }] }).catch(error => {
      console.log(error);
    });
  };

  return (
    <Modal style={styleModal} isOpen={isWalletConnected && isWrongNetwork}>
      <h1>Connect your wallet to Kovan Network to use our prediction market.</h1>
      <h3>Our system indicates that your wallet is not connected to Ethereum&apos;s Kovan network.</h3>
      <button type="button" onClick={switchChain}>
        Switch Networks
      </button>
    </Modal>
  );
}

WrongNetworkModal.propTypes = {
  isWalletConnected: PropTypes.bool.isRequired,
  isWrongNetwork: PropTypes.bool.isRequired,
};
