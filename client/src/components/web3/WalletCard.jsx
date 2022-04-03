import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ethers } from 'ethers';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { CgProfile } from 'react-icons/cg';

// ABI
import NHLGamePredictionsABI from '../../NHLGamePredictionsABI.json';

export default function WalletCard({
  user,
  setUser,
  setContract,
  isWalletConnected,
  setIsWalletConnected,
  setIsWrongNetwork,
  showAccountModal,
  setShowAccountModal,
  currentAddr,
  setCurrentAddr,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.ethereum) {
      // console.log('trying to connect to read wallet');

      const userTmp = JSON.parse(localStorage.getItem('persist-account'));
      if (userTmp) {
        setUser(userTmp);
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      if (signer)
        signer
          .getAddress()
          .then(address => {
            console.log(`wallet is unlocked: ${address}`);
            setCurrentAddr(address);

            if (userTmp && userTmp.addr === address) {
              setIsWalletConnected(true);
            }

            provider.getNetwork().then(network => {
              if (network.name === 'kovan') {
                const c = new ethers.Contract(
                  '0x4e5e10C3Ef12663ba231d16b915372E0E69D1ffe',
                  NHLGamePredictionsABI,
                  signer
                );
                setContract(c);
              } else {
                setIsWrongNetwork(true);
              }
            });
          })
          .catch(e => alert(`Your metamask account is not unlocked! ${e}`));
    }
  }, []);

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', useEffect);
    window.ethereum.on('chainChanged', chainChangedHandler);
  }

  const render_account_button = () => {
    let name = user.name;

    if (isWalletConnected) {
      name = `${currentAddr.substring(0, 6)}...${currentAddr.slice(-4)}`;
    }

    return (
      <table>
        <tbody>
          <tr>
            <td>
              <CgProfile size={50} />
            </td>
            <td>
              <b>{name}</b>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <button onClick={user ? () => setShowAccountModal(!showAccountModal) : () => navigate('/login')} type="button">
      <div>
        <b>{user ? render_account_button() : 'Connect'}</b>
      </div>
    </button>
  );
}

WalletCard.propTypes = {
  user: PropTypes.shape({ addr: PropTypes.string.isRequired }),
  setUser: PropTypes.func.isRequired,
  setContract: PropTypes.func.isRequired,
  isWalletConnected: PropTypes.bool.isRequired,
  setIsWalletConnected: PropTypes.func.isRequired,
  setIsWrongNetwork: PropTypes.func.isRequired,
};

WalletCard.defaultProps = {
  user: null,
};
