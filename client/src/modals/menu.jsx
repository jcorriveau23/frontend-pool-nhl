// This modal gives information related to the wallet.
// - amount of Eth.
// - quick copy of the wallet adresse.
// - quick log out button.

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

// icons
import { MdLeaderboard, MdQueryStats } from 'react-icons/md';
import { BsPenFill } from 'react-icons/bs';
import { FaGamepad, FaEthereum, FaHome } from 'react-icons/fa';
import { GiPodiumWinner } from 'react-icons/gi';
import { RiTeamFill } from 'react-icons/ri';

// css
import './modal.css';

export default function MenuModal({ user, isWalletConnected, showMenuModal, setShowMenuModal, buttonMenuRef }) {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    <Modal
      className="menuModal"
      overlayClassName="noOverlay"
      isOpen={showMenuModal}
      appElement={document.getElementById('root')}
    >
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
          <tr
            style={window.location.pathname.includes('/pools') ? { color: '#fff' } : null}
            onClick={() => link_to('/pools')}
          >
            <td>
              <FaGamepad size={45} />
            </td>
            <td>Pools</td>
          </tr>
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
            style={window.location.pathname.includes('/stats') ? { color: '#fff' } : null}
            onClick={() => link_to('/stats')}
          >
            <td>
              <MdQueryStats size={45} />
            </td>
            <td>Players Stats</td>
          </tr>
          <tr
            style={window.location.pathname.includes('/teams') ? { color: '#fff' } : null}
            onClick={() => link_to('/teams')}
          >
            <td>
              <RiTeamFill size={45} />
            </td>
            <td>Teams</td>
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
