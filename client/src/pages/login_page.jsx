// Page where we can decide if we want to login with a wallet or not. The user should be able to connect without a wallet.

// without wallet:
// - username
// - password
// - email address

// with wallet:
// connect button
// by default gives the address name as account name

// when connecting navigate directly to home page. "/" as route.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import Cookies from 'js-cookie';

export default function LoginPage({ user, setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState(''); // for Register
  const [email, setEmail] = useState(''); // for Register
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false); // by default propose login parameter

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, []);

  const wallet_login = () => {
    try {
      if (!window.ethereum) throw new Error('Please install MetaMask browser extension to interact');

      window.ethereum.request({ method: 'eth_requestAccounts' }).then(result => {
        console.log(result);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        signer.signMessage('Unlock wallet to access nhl-pool-ethereum.').then(sig => {
          signer.getAddress().then(addr => {
            axios.post('https://hockeypool.live/api/auth/wallet_login', { addr, sig }).then(res => {
              if (res.data.success === 'True') {
                Cookies.set(`token-${res.data.user.name}`, res.data.token);
                localStorage.setItem('persist-account', JSON.stringify(res.data.user));
                setUser(res.data.user);
                navigate('/');
              } else {
                setUser(null);
              }
            });
          });
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  const login = () => {
    axios.post('https://hockeypool.live/api/auth/login', { username, password }).then(res => {
      if (res.data.success === 'True') {
        Cookies.set(`token-${res.data.user.name}`, res.data.token);
        localStorage.setItem('persist-account', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/');
      } else {
        setUser(null);
      }
    });
  };

  const register = () => {
    if (password === repeatPassword) {
      axios
        .post('https://hockeypool.live/api/auth/register', {
          username,
          email,
          password,
          phone: 'TODO',
        })
        .then(res => {
          if (res.data.success === 'True') {
            login(); // when the registration is success, login the user directly.
            navigate('/profile');
          } else {
            setMsg(res.data.message);
          }
        });
    } else {
      setMsg('Error, password and repeated password does not correspond!');
    }
  };

  return (
    <div>
      {isRegister ? (
        <div className="modal_content">
          <h2>Register an account</h2>
          <form>
            <p>Please fill in this form to create an account.</p>
            <input
              type="text"
              placeholder="Enter Username"
              onChange={event => setUsername(event.target.value)}
              required
            />
            <input type="text" placeholder="Enter Email" onChange={event => setEmail(event.target.value)} required />
            <input
              type="password"
              placeholder="Enter Password"
              onChange={event => setPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Repeat Password"
              onChange={event => setRepeatPassword(event.target.value)}
              required
            />
          </form>
          <button onClick={() => register()} type="button">
            Register
          </button>
          <button onClick={() => setIsRegister(false)} type="button">
            Already Registered
          </button>
          <p style={{ color: 'red' }}>{msg}</p>
        </div>
      ) : (
        <div className="modal_content">
          <h2>Login from a username and password</h2>
          <form>
            <p>Please fill in this form to login.</p>
            <input
              type="text"
              placeholder="Enter Username"
              onChange={event => setUsername(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter Password"
              onChange={event => setPassword(event.target.value)}
              required
            />
          </form>
          <button onClick={() => login()} type="button">
            Login
          </button>
          <button onClick={() => setIsRegister(true)} type="button">
            Register an Account
          </button>
        </div>
      )}
      <div className="modal_content">
        <h2>Login using a wallet</h2>
        <button onClick={() => wallet_login()} type="button">
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  setUser: PropTypes.func.isRequired,
};
