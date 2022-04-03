// This modal gives information related to the wallet.
// - amount of Eth.
// - quick copy of the wallet adresse.
// - quick log out button.

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

// icons
import { MdLeaderboard } from 'react-icons/md';
import { BsPenFill } from 'react-icons/bs';
import { FaGamepad, FaEthereum, FaHome } from 'react-icons/fa';
import { GiPodiumWinner } from 'react-icons/gi';

// css
import './modal.css';

export default function MenuModal({ user, isWalletConnected, showMenuModal, setShowMenuModal, buttonMenuRef }) {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(window.location.pathname);
    // Since we disabled the overlay we need to add a custom way of closing the modal when clicking outside of the modal.
    const handleClickOutside = event => {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        buttonMenuRef.current &&
        !buttonMenuRef.current.contains(event.target)
      ) {
        setShowMenuModal(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const link_to = dest => {
    setShowMenuModal(false);
    navigate(dest);
  };

  return (
    <Modal className="menuModal" overlayClassName="noOverlay" isOpen={showMenuModal}>
      <table ref={ref}>
        <thead>
          <tr style={window.location.pathname === '/' ? { color: '#fff' } : null} onClick={() => link_to('/')}>
            <td>
              <FaHome size={45} />
            </td>
            <td>Home</td>
          </tr>
        </thead>
        <tbody>
          {user ? (
            <tr
              style={window.location.pathname.includes('/my-pools') ? { color: '#fff' } : null}
              onClick={() => link_to('/my-pools')}
            >
              <td>
                <FaGamepad size={45} />
              </td>
              <td>My Pools</td>
            </tr>
          ) : null}
          {isWalletConnected ? (
            <tr
              style={window.location.pathname.includes('/my-bets') ? { color: '#fff' } : null}
              onClick={() => link_to('/my-bets')}
            >
              <td>
                <FaEthereum size={45} />
              </td>
              <td>My Game Bets</td>
            </tr>
          ) : null}
          <tr
            style={window.location.pathname.includes('/standing') ? { color: '#fff' } : null}
            onClick={() => link_to('/standing')}
          >
            <td>
              <MdLeaderboard size={45} />
            </td>
            <td>Standing</td>
          </tr>
          <tr
            style={window.location.pathname.includes('/leaders') ? { color: '#fff' } : null}
            onClick={() => link_to('/leaders')}
          >
            <td>
              <GiPodiumWinner size={45} />
            </td>
            <td>League leaders</td>
          </tr>
          <tr
            style={window.location.pathname.includes('/draft') ? { color: '#fff' } : null}
            onClick={() => link_to('/draft')}
          >
            <td>
              <BsPenFill size={45} />
            </td>
            <td>Draft</td>
          </tr>
        </tbody>
      </table>
    </Modal>
  );
}

MenuModal.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    addr: PropTypes.string.isRequired,
    pool_list: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
  isWalletConnected: PropTypes.bool.isRequired,
  showMenuModal: PropTypes.bool.isRequired,
  setShowMenuModal: PropTypes.func.isRequired,
};
