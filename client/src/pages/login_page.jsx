// Page where we can decide if we want to login with a wallet or not. The user should be able to connect without a wallet.

// without wallet:
// - name
// - password
// - email address

// with wallet:
// connect button
// by default gives the address name as account name

// when connecting navigate directly to home page. "/" as route.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import Cookies from 'js-cookie';
import { BsFacebook } from 'react-icons/bs';
import { fbLogin } from '../utils/facebookSDK';
// css
import './page.css';

export default function LoginPage({
  user,
  setUser,
  authResponse,
  setAuthResponse,
  setIsWalletConnected,
  setCurrentAddr,
}) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState(''); // for Register
  const [email, setEmail] = useState(''); // for Register
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false); // by default propose login parameter

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  const wallet_login = async () => {
    if (!window.ethereum) throw new Error('Please install MetaMask browser extension to interact');
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const sig = await signer.signMessage('Unlock wallet to access nhl-pool-ethereum.');
    const addr = await signer.getAddress();
    try {
      const res = await axios.post('/api-rust/user/wallet-login', { addr, sig });
      Cookies.set(`token-${res.data.user._id}`, res.data.token);
      localStorage.setItem('persist-account', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsWalletConnected(true);
      setCurrentAddr(addr);

      navigate('/'); // Navigate to the home page on success wallet login.
    } catch (e) {
      alert(e.response.data);
    }
  };

  const login = async () => {
    try {
      const res = await axios.post('/api-rust/user/login', { name, password });
      Cookies.set(`token-${res.data.user._id}`, res.data.token);
      localStorage.setItem('persist-account', JSON.stringify(res.data.user));
      setUser(res.data.user);

      navigate('/'); // Navigate to the home page on success login.
    } catch (e) {
      alert(e.response.data);
    }
  };

  const social_login = async () => {
    const response = await fbLogin();

    if (response.authResponse !== null) {
      setAuthResponse(response.authResponse);
      try {
        const res = await axios.post('/api-rust/user/social-login', response.authResponse);
        Cookies.set(`token-${res.data.user._id}`, res.data.token);
        localStorage.setItem('persist-account', JSON.stringify(res.data.user));
        setUser(res.data.user);

        navigate('/'); // Navigate to the home page on success login.
      } catch (e) {
        alert(e.response.data);
      }
    } else {
      alert('facebook login did not worked.');
    }
  };

  const register = async () => {
    if (password === repeatPassword) {
      try {
        const res = await axios.post('/api-rust/user/register', {
          name,
          email,
          password,
          phone: 'TODO',
        });
        Cookies.set(`token-${res.data.user._id}`, res.data.token);
        localStorage.setItem('persist-account', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/');
      } catch (e) {
        alert(e.response.datas);
      }
    } else {
      alert('password and repeated password does not correspond!');
    }
  };

  return (
    <div className="min-width">
      <div className="cont">
        <button className="base-button" type="button" onClick={() => social_login()}>
          <table>
            <tr>
              <td>
                <BsFacebook size={50} />
              </td>
              <td>Login with Facebook</td>
            </tr>
          </table>
        </button>
      </div>
      <div className="cont">
        {isRegister ? (
          <div className="form-content">
            <h1>Register an account</h1>
            <form>
              <h2>Please fill in this form to create an account.</h2>
              <input
                type="text"
                placeholder="Enter Username"
                onChange={event => setName(event.target.value)}
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
            <button className="login_register_button" onClick={() => register()} type="button">
              Register
            </button>
            <button className="base-button_no_border" onClick={() => setIsRegister(false)} type="button">
              Already Registered...
            </button>
          </div>
        ) : (
          <div className="form-content">
            <h1>Login using a username and password</h1>
            <form>
              <p>Please fill in this form to login.</p>
              <input
                type="text"
                placeholder="Enter Username"
                onChange={event => setName(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Enter Password"
                onChange={event => setPassword(event.target.value)}
                required
              />
            </form>
            <button className="login_register_button" onClick={() => login()} type="button">
              Login
            </button>
            <button className="base-button_no_border" onClick={() => setIsRegister(true)} type="button">
              Register an Account...
            </button>
          </div>
        )}
      </div>
      <div className="cont">
        <div className="form-content">
          <h1>Login using a wallet</h1>
          <button className="connect_metamask_button" onClick={() => wallet_login()} type="button">
            <table>
              <tbody>
                <tr>
                  <td>
                    <img src="https://static.loopring.io/assets/svg/meta-mask.svg" alt="" width={30} height={30} />
                  </td>
                  <td>Connect Wallet</td>
                </tr>
              </tbody>
            </table>
          </button>
        </div>
      </div>
    </div>
  );
}
