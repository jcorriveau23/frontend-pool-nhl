import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ethers } from 'ethers';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

// ABI
import NHLGamePredictionsABI from '../../NHLGamePredictionsABI.json';

// css
import './WalletCard.css';

// icons
import LOCKED from '../img/web3/Locked_icon_red.svg';
import UNLOCKED from '../img/web3/Unlocked_icon.png';

export default function WalletCard({ user, setUser, setContract, setIsWalletConnected, setIsWrongNetwork }) {
  const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);
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

    const userTmp = JSON.parse(localStorage.getItem('persist-account'));

    if (userTmp) {
      setUser(userTmp);
      setCurrentAddr(userTmp.addr);
    }

    if (window.ethereum && userTmp) {
      // console.log(user.addr);
      const token = Cookies.get(`token-${userTmp.name}`);

      if (token) {
        // TODO: also validate that the token is not expired
        setIsWalletUnlocked(true);
        setIsWalletConnected(true);
      }
    }
  }, []);

  // const connectWalletHandler = () => {
  //   // const provider = new ethers.providers.Web3Provider(window.ethereum) // TODO: use const provider = new ethers.providers.Web3Provider(window.ethereum) instead
  //   setIsWalletConnected(false);
  //   setIsWalletUnlocked(false);
  //   setUser(null);

  //   if (window.ethereum && window.ethereum.isMetaMask) {
  //     window.ethereum
  //       .request({ method: 'eth_requestAccounts' })
  //       .then(result => {
  //         setCurrentAddr(result[0]);
  //         setIsWalletConnected(true);

  //         const userTmp = JSON.parse(localStorage.getItem('persist-account'));

  //         const token = Cookies.get(`token-${userTmp.name}`);

  //         if (token) {
  //           // TODO: also validate that the token is not expired
  //           setUser(userTmp);
  //           setIsWalletUnlocked(true);
  //         }
  //       })
  //       .catch(error => {
  //         alert(error.message);
  //       });
  //   } else alert('Please install MetaMask browser extension at: https://metamask.io/download.');
  // };

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };

  const isCurrentWalletUnlocked = () =>
    user ? isWalletUnlocked && user.addr.toLowerCase() === currentAddr.toLowerCase() : false;

  if (window.ethereum) {
    // window.ethereum.on('accountsChanged', connectWalletHandler);
    window.ethereum.on('chainChanged', chainChangedHandler);
  }

  return (
    <li className="walletCard">
      <button onClick={user ? () => navigate('/profile') : () => navigate('/login')} type="button">
        <div className="accountDisplay">
          <img src={isCurrentWalletUnlocked() ? UNLOCKED : LOCKED} alt="" width="20" height="20" />
          <b>{currentAddr ? `${currentAddr.substring(0, 6)}...${currentAddr.slice(-4)}` : 'Connect'}</b>
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
