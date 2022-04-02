import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ethers } from 'ethers';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

// ABI
import NHLGamePredictionsABI from '../../NHLGamePredictionsABI.json';

// css
import './WalletCard.css';

export default function WalletCard({ user, setUser, setContract, setIsWalletConnected, setIsWrongNetwork }) {
  const [currentAddr, setCurrentAddr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (window.ethereum) {
      // console.log('trying to connect to read wallet');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      signer
        .getAddress()
        .then(address => {
          console.log(`wallet is unlocked: ${address}`);
          setCurrentAddr(address);

          const userTmp = JSON.parse(localStorage.getItem('persist-account'));

          if (userTmp) {
            setUser(userTmp);

            if (userTmp.addr === address) {
              setIsWalletConnected(true);
            }
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

  return (
    <li className="walletCard">
      <button onClick={user ? () => navigate('/profile') : () => navigate('/login')} type="button">
        <div className="accountDisplay">
          <b>{user ? `${currentAddr.substring(0, 6)}...${currentAddr.slice(-4)}` : 'Connect'}</b>
        </div>
      </button>
    </li>
  );
}

WalletCard.propTypes = {
  user: PropTypes.shape({ addr: PropTypes.string.isRequired }),
  setUser: PropTypes.func.isRequired,
  setContract: PropTypes.func.isRequired,
  setIsWalletConnected: PropTypes.func.isRequired,
  setIsWrongNetwork: PropTypes.func.isRequired,
};

WalletCard.defaultProps = {
  user: null,
};
