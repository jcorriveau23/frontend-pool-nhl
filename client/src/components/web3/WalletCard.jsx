import React, { useState, useEffect } from 'react';
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

export default function WalletCard({ user, setUser, setContract }) {
  const [networkName, setNetworkName] = useState('');
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [currentAddr, setCurrentAddr] = useState('');

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
            // console.log(network);
            if (network.chainId === 1) {
              setNetworkName('Ethereum');
            } else {
              setNetworkName(network.name);
            }

            if (network.name === 'kovan') {
              const c = new ethers.Contract(
                '0x4e5e10C3Ef12663ba231d16b915372E0E69D1ffe',
                NHLGamePredictionsABI,
                signer
              );
              setContract(c);
            } else {
              setIsWrongNetwork(true);
              alert('You need to select Kovan Network in metamask plugin.');
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
      const token = Cookies.get(`token-${userTmp.addr}`);

      if (token) {
        // TODO: also validate that the token is not expired
        setIsWalletUnlocked(true);
        setIsWalletConnected(true);
      }
    }
  }, []);

  const connectWalletHandler = () => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum) // TODO: use const provider = new ethers.providers.Web3Provider(window.ethereum) instead
    setIsWalletConnected(false);

    if (window.ethereum && window.ethereum.isMetaMask) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(result => {
          setCurrentAddr(result[0]);
          setIsWalletConnected(true);

          const token = Cookies.get(`token-${result[0]}`);

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
        console.log(result);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        signer.signMessage('Unlock wallet to access nhl-pool-ethereum.').then(sig => {
          signer.getAddress().then(addr => {
            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ addr, sig }),
            };
            fetch('https://hockeypool.live/api/auth/login', requestOptions)
              .then(response => response.json())
              .then(data => {
                if (data.success === 'True') {
                  // console.log(result[0])
                  // console.log(addr)

                  Cookies.set(`token-${addr}`, data.token);
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

  const isCurrentWalletUnlocked = () =>
    user ? isWalletUnlocked && user.addr.toLowerCase() === currentAddr.toLowerCase() : false;

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', connectWalletHandler);
    window.ethereum.on('chainChanged', chainChangedHandler);
  }

  const switchChain = () => {
    // reload the page to avoid any errors with chain change mid use of application

    window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2A' }] }).catch(error => {
      console.log(error);
    });
  };

  const walletClickHandler = () => {
    if (isWalletConnected) {
      if (!isCurrentWalletUnlocked()) {
        unlockWallet();
      }
    } else {
      connectWalletHandler();
    }
  };

  return (
    <li className="walletCard">
      <button onClick={walletClickHandler} type="button">
        <div className="accountDisplay">
          <img src={isCurrentWalletUnlocked() ? UNLOCKED : LOCKED} alt="" width="20" height="20" />
          <b>{currentAddr ? `${currentAddr.substring(0, 6)}...${currentAddr.slice(-4)}` : 'Connect Wallet'}</b>
        </div>
      </button>
      {isWalletConnected ? (
        <button onClick={isWrongNetwork ? switchChain : null} disabled={!isWrongNetwork} type="button">
          <b style={isWrongNetwork ? { color: '#b00' } : { color: '#00a' }}>{networkName}</b>
        </button>
      ) : null}
      {/* <div>
				<b style={{ color: '#b00' }}>{errorMessage}</b>
			</div> */}
    </li>
  );
}

WalletCard.propTypes = {
  user: PropTypes.shape({ addr: PropTypes.string.isRequired }),
  setUser: PropTypes.func.isRequired,
  setContract: PropTypes.func.isRequired,
};

WalletCard.defaultProps = {
  user: null,
};
