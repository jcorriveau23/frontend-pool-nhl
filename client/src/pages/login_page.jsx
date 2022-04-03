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

// css
import './page.css';

export default function LoginPage({ user, setUser, setIsWalletConnected, setCurrentAddr }) {
  const [username, setUsername] = useState('');
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

  const wallet_login = () => {
    try {
      if (!window.ethereum) throw new Error('Please install MetaMask browser extension to interact');

      window.ethereum.request({ method: 'eth_requestAccounts' }).then(result => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        signer.signMessage('Unlock wallet to access nhl-pool-ethereum.').then(sig => {
          signer.getAddress().then(addr => {
            axios.post('/api/auth/wallet_login', { addr, sig }).then(res => {
              if (res.data.success === true) {
                Cookies.set(`token-${res.data.user._id}`, res.data.token);
                localStorage.setItem('persist-account', JSON.stringify(res.data.user));
                setUser(res.data.user);
                setIsWalletConnected(true);
                console.log(addr);
                setCurrentAddr(addr);
                navigate('/');
              } else {
                setUser(null);
                setIsWalletConnected(false);
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
    axios.post('/api/auth/login', { username, password }).then(res => {
      if (res.data.success === true) {
        Cookies.set(`token-${res.data.user._id}`, res.data.token);
        localStorage.setItem('persist-account', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/');
      } else {
        setUser(null);
        alert(res.data.message);
      }
    });
  };

  const register = () => {
    if (password === repeatPassword) {
      axios
        .post('/api/auth/register', {
          username,
          email,
          password,
          phone: 'TODO',
        })
        .then(res => {
          if (res.data.success === true) {
            login(); // when the registration is success, login the user directly.
            navigate('/profile');
          } else {
            alert(res.data.message);
          }
        });
    } else {
      alert('password and repeated password does not correspond!');
    }
  };

  return (
    <div className="min-width">
      <div className="floatLeft">
        <div className="half_cont">
          {isRegister ? (
            <div className="login_content">
              <h2>Register an account</h2>
              <form>
                <p>Please fill in this form to create an account.</p>
                <input
                  type="text"
                  placeholder="Enter Username"
                  onChange={event => setUsername(event.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Enter Email"
                  onChange={event => setEmail(event.target.value)}
                  required
                />
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
              <button className="base_button_no_border" onClick={() => setIsRegister(false)} type="button">
                Already Registered...
              </button>
            </div>
          ) : (
            <div className="login_content">
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
              <button className="login_register_button" onClick={() => login()} type="button">
                Login
              </button>
              <button className="base_button_no_border" onClick={() => setIsRegister(true)} type="button">
                Register an Account...
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="floatRight">
        <div className="half_cont">
          <div className="login_content">
            <h2>Login using a wallet</h2>
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
    </div>
  );
}

LoginPage.propTypes = {
  setUser: PropTypes.func.isRequired,
};
