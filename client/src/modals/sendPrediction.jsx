import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

// images
import { logos } from '../components/img/logos';

// css
import './modal.css';

export default function SendPredictionModal({
  // user,
  gameID,
  gameInfo,
  // gameData,
  contract,
  showSendPredictionModal,
  setShowSendPredictionModal,
  reRender,
  setReRender,
}) {
  const [errorMsg, setErrorMsg] = useState('');
  const [amountEthersInput, setAmountEthersInput] = useState('');
  const [predictedTeam, setPredictedTeam] = useState('');
  const [waitingTransaction, setWaitingTransaction] = useState(false);
  const [transactionSuccessMsg, setTransactionSuccessMsg] = useState('');

  const listenEvents = () => {
    contract.on('CreatePredictionMarket', (from, id) => {
      // console.log('Event CreatedPredictionMarket: ' + parseInt(id) + '   From: ' + from);
      if (parseInt(id, 10) === parseInt(gameID, 10)) {
        // console.log("Rerenderplz: " + reRender)
        setReRender(!reRender);
      }
    });

    contract.on('SendBet', (from, id, isHome, value) => {
      console.log(`Event SendBet: ${parseInt(id, 10)} From: ${from} Home: ${isHome} Amount: ${value}`);
      // console.log(parseInt(gameID))
      if (parseInt(id, 10) === parseInt(gameID, 10)) {
        // console.log("Rerenderplz: " + reRender)
        setReRender(!reRender);
        setWaitingTransaction(false);
        setTransactionSuccessMsg('Transaction Succeeded :)!'); // TODO: should only returned this when the transaction is the user one.
        // if(from === contract.signer()){
        //     console.log("Transaction completed! ")
        //     setWaitingTransaction(false)
        // }
      }
    });
  };

  useEffect(() => {
    listenEvents();

    return () => {
      contract.removeAllListeners('CreatePredictionMarket');
    };
  }, []);

  const sendPrediction = async () => {
    if (amountEthersInput === '' || predictedTeam === '') {
      setErrorMsg('Select a team and an amount in Ethers.');
      return;
    }

    const isHome = gameInfo.liveData.boxscore.teams.home.team.name === predictedTeam;

    const overrides = {
      value: ethers.utils.parseEther(amountEthersInput), // sending one ether
      gasLimit: 150000, // optional
    };

    await contract.sendBet(gameInfo.gamePk, isHome, overrides);
    setWaitingTransaction(true);
  };

  if (gameInfo)
    return (
      <Modal
        className="base-modal"
        overlayClassName="base-overlay"
        appElement={document.getElementById('root')}
        isOpen={showSendPredictionModal}
        onRequestClose={() => setShowSendPredictionModal(false)}
      >
        <div className="modal_content">
          <h2>Send a Prediction</h2>
          <div>
            <p>Which team do you predict to win the game?</p>
            <input
              type="number"
              placeholder="Amount of Ethers"
              min="0.05"
              step="0.001"
              onChange={event => setAmountEthersInput(event.target.value)}
              required
            />
            <div className="float-left">
              <div>
                <img src={logos[gameInfo.liveData.boxscore.teams.home.team.id]} alt="" width="100" height="100" />
              </div>
              <input
                type="radio"
                name="team[]"
                value={gameInfo.liveData.boxscore.teams.home.team.name}
                onChange={event => setPredictedTeam(event.target.value)}
                required
              />
            </div>
            <div className="float-right">
              <div>
                <img src={logos[gameInfo.liveData.boxscore.teams.away.team.id]} alt="" width="100" height="100" />
              </div>
              <input
                type="radio"
                name="team[]"
                value={gameInfo.liveData.boxscore.teams.away.team.name}
                onChange={event => setPredictedTeam(event.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <button
              className="base-button"
              onClick={() => sendPrediction()}
              disabled={waitingTransaction}
              type="button"
            >
              Predict {predictedTeam}{' '}
            </button>
          </div>
          {waitingTransaction ? (
            <div>
              <div>
                <b>The transaction is being processed...</b>
              </div>
              <div>
                <ClipLoader color="#fff" loading size={75} />
              </div>
            </div>
          ) : null}
          <div>
            <b style={{ color: '#070' }}>{transactionSuccessMsg}</b>
          </div>
          <p style={{ color: 'red' }}>{errorMsg}</p>
        </div>
      </Modal>
    );
}

SendPredictionModal.propTypes = {
  gameID: PropTypes.string.isRequired,
  gameInfo: PropTypes.shape({
    gamePk: PropTypes.string.isRequired,
    liveData: PropTypes.shape({
      boxscore: PropTypes.shape({
        teams: PropTypes.shape({
          away: PropTypes.shape({ team: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired }).isRequired,
          home: PropTypes.shape({ team: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired }).isRequired,
        }),
      }),
    }).isRequired,
  }),
  contract: PropTypes.shape({
    on: PropTypes.func.isRequired,
    removeAllListeners: PropTypes.func.isRequired,
    sendBet: PropTypes.func.isRequired,
  }).isRequired,
  showSendPredictionModal: PropTypes.bool.isRequired,
  setShowSendPredictionModal: PropTypes.func.isRequired,
  reRender: PropTypes.bool.isRequired,
  setReRender: PropTypes.func.isRequired,
};

SendPredictionModal.defaultProps = {
  gameInfo: null,
};
