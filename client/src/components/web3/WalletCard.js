import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './WalletCard.css';
import NHLGamePredictionsABI from '../../NHLGamePredictionsABI.json';
// icons
import LOCKED from '../img/web3/Locked_icon_red.svg';
import UNLOCKED from '../img/web3/Green_dot.svg';

import Cookies from 'js-cookie';

const WalletCard = ({ user, setUser, contract, setContract }) => {
  const [networkName, setNetworkName] = useState('');
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [currentAddr, setCurrentAddr] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      console.log('trying to connect to read wallet');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      signer
        .getAddress()
        .then(address => {
          console.log('wallet is unlocked: ' + address);
          provider.getNetwork().then(network => {
            console.log(network);
            network.chainId === 1 ? setNetworkName('Ethereum') : setNetworkName(network.name);
            if (network.name === 'kovan') {
              let c = new ethers.Contract('0x4e5e10C3Ef12663ba231d16b915372E0E69D1ffe', NHLGamePredictionsABI, signer);
              setContract(c);
            } else {
              setIsWrongNetwork(true);
              alert('You need to select Kovan Network in metamask plugin.');
            }
          });
        })
        .catch(err => alert('Your metamask account is not unlocked!'));
    }

    const user = JSON.parse(localStorage.getItem('persist-account'));

    if (user) {
      setUser(user);
      setCurrentAddr(user.addr);
    }

    if (window.ethereum && user) {
      console.log(user.addr);
      const token = Cookies.get('token-' + user.addr);

      if (token) {
        // TODO: also validate that the token is not expired
        setIsWalletUnlocked(true);
        setIsWalletConnected(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connectWalletHandler = () => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum) // TODO: use const provider = new ethers.providers.Web3Provider(window.ethereum) instead
    setIsWalletConnected(false);

    if (window.ethereum && window.ethereum.isMetaMask) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(result => {
          setCurrentAddr(result[0]);
          setIsWalletConnected(true);

          const token = Cookies.get('token-' + result[0]);

          if (token) {
            // TODO: also validate that the token is not expired

            setIsWalletUnlocked(true);
          }
        })
        .catch(error => {
          alert(error.message);
        });
    } else alert('Please install MetaMask browser extension at: https://metamask.io/download.');
  };

  const unlockWallet = () => {
    try {
      if (!window.ethereum) throw new Error('Please install MetaMask browser extension to interact');

      window.ethereum.request({ method: 'eth_requestAccounts' }).then(result => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        signer.signMessage('Unlock wallet to access nhl-pool-ethereum.').then(sig => {
          signer.getAddress().then(addr => {
            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ addr: addr, sig: sig }),
            };
            fetch('/auth/login', requestOptions)
              .then(response => response.json())
              .then(data => {
                if (data.success === 'True') {
                  // console.log(result[0])
                  // console.log(addr)

                  Cookies.set('token-' + addr, data.token);
                  localStorage.setItem('persist-account', JSON.stringify(data.user));
                  setUser(data.user);

                  setIsWalletUnlocked(true);
                } else alert(data.message);
              });
          });
        });
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };

  const isCurrentWalletUnlocked = () => {
    return user ? isWalletUnlocked && user.addr.toLowerCase() === currentAddr.toLowerCase() : false;
  };

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', connectWalletHandler);
    window.ethereum.on('chainChanged', chainChangedHandler);
  }

  const switchChain = () => {
    // reload the page to avoid any errors with chain change mid use of application
    console.log('try to switch chain!');
    window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2A' }] }).catch(error => {
      console.log(error);
    });
  };

  return (
    <li className="walletCard">
      <button onClick={!isWalletConnected ? connectWalletHandler : !isCurrentWalletUnlocked() ? unlockWallet : null}>
        <div className="accountDisplay">
          <img src={isCurrentWalletUnlocked() ? UNLOCKED : LOCKED} alt="" width="15" height="15"></img>
          <b>{currentAddr ? currentAddr.substring(0, 6) + '...' + currentAddr.slice(-4) : 'Connect Wallet'}</b>
          {/*user? <h3>session addr: {user.addr}</h3> : null*/}
        </div>
      </button>
      {isWalletConnected ? (
        <button onClick={isWrongNetwork ? switchChain : null} disabled={!isWrongNetwork}>
          <b style={isWrongNetwork ? { color: '#b00' } : { color: '#00a' }}>{networkName}</b>
        </button>
      ) : null}
      {/* <div>
				<b style={{ color: '#b00' }}>{errorMessage}</b>
			</div> */}
    </li>
  );
};

export default WalletCard;
