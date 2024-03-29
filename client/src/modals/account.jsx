// This modal gives information related to the wallet.
// - amount of Eth.
// - quick copy of the wallet adresse.
// - quick log out button.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

import { IoIosArrowForward } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa';
import { BiCopy } from 'react-icons/bi';

// css
import './modal.css';

export default function AccountModal({
  user,
  isWalletConnected,
  showAccountModal,
  setShowAccountModal,
  buttonAccountRef,
}) {
  const [ethAmount /* setEthAmount */] = useState(0.0);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isWalletConnected) {
      // TODO: get the amount of eth in the wallet on the Kovan network.
    }

    // Since we disabled the overlay we need to add a custom way of closing the modal when clicking outside of the modal.
    const handleClickOutside = event => {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        buttonAccountRef.current &&
        !buttonAccountRef.current.contains(event.target)
      ) {
        setShowAccountModal(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const link_to = dest => {
    setShowAccountModal(false);
    navigate(dest);
  };

  return (
    <Modal
      className="accountModal"
      overlayClassName="noOverlay"
      isOpen={showAccountModal}
      appElement={document.getElementById('root')}
    >
      <table ref={ref}>
        <tbody>
          <tr onClick={() => link_to('/profile')}>
            <td>Profile</td>
            <td>
              <IoIosArrowForward size={30} />
            </td>
          </tr>
          {user
            ? user.pool_list?.map(poolName => (
                <tr key={poolName} onClick={() => link_to(`/pools/${poolName}`)}>
                  <td colSpan={2}>{poolName}</td>
                </tr>
              ))
            : null}
          {isWalletConnected ? (
            <>
              <tr>
                <td>
                  {user ? (
                    <>
                      {user.addr.substring(0, 6)}...{user.addr.slice(-4)}
                    </>
                  ) : null}
                </td>
                <td colSpan={2} align="right">
                  <FaEthereum size={30} />
                  {ethAmount}
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    className="base-button_no_border"
                    onClick={() => navigator.clipboard.writeText(user.addr)} // copy address to clipboard.
                    type="button"
                  >
                    <BiCopy size={30} />
                    Copy address
                  </button>
                </td>
                <td colSpan={2} align="right">
                  $0.00
                </td>
              </tr>
            </>
          ) : null}
        </tbody>
      </table>
    </Modal>
  );
}
