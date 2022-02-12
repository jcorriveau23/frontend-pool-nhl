import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { ethers } from 'ethers';

import logos from '../components/img/images';

import { styleModal } from './styleModal';
import ClipLoader from 'react-spinners/ClipLoader';

function SendPredictionModal({
  user,
  gameID,
  gameInfo,
  gameData,
  contract,
  showSendPredictionModal,
  setShowSendPredictionModal,
  reRender,
  setRerender,
}) {
  const [errorMsg, setErrorMsg] = useState('');
  const [amountEthersInput, setAmountEthersInput] = useState('');
  const [predictedTeam, setPredictedTeam] = useState('');
  const [waitingTransaction, setWaitingTransaction] = useState(false);
  const [transactionSuccessMsg, setTransactionSuccessMsg] = useState('');

  useEffect(() => {
    listenEvents();

    return () => {
      contract.removeAllListeners('CreatePredictionMarket');
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendPrediction = async () => {
    if (amountEthersInput === '' || predictedTeam === '') {
      setErrorMsg('Select a team and an amount in Ethers.');
      return;
    }

    const isHome = gameInfo.liveData.boxscore.teams.home.team.name === predictedTeam;

    const overrides = {
      value: ethers.utils.parseEther(amountEthersInput), //sending one ether
      gasLimit: 150000, //optional
    };

    await contract.sendBet(gameInfo.gamePk, isHome, overrides);
    setWaitingTransaction(true);
  };

  const listenEvents = () => {
    contract.on('CreatePredictionMarket', (from, id) => {
      console.log('Event CreatedPredictionMarket: ' + parseInt(id) + '   From: ' + from);
      if (parseInt(id) === parseInt(gameID)) {
        // console.log("Rerenderplz: " + reRender)
        setRerender(!reRender);
      }
    });

    contract.on('SendBet', (from, id, isHome, value) => {
      console.log('Event SendBet: ' + parseInt(id) + '   From: ' + from + '   Home: ' + isHome + 'amount: ' + value);
      // console.log(parseInt(gameID))
      if (parseInt(id) === parseInt(gameID)) {
        // console.log("Rerenderplz: " + reRender)
        setRerender(!reRender);
        setWaitingTransaction(false);
        setTransactionSuccessMsg('Transaction Succeeded :)!'); // TODO: should only returned this when the transaction is the user one.
        // if(from === contract.signer()){
        //     console.log("Transaction completed! ")
        //     setWaitingTransaction(false)
        // }
      }
    });
  };

  if (gameInfo)
    return (
      <Modal
        style={styleModal}
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
            <div className="floatLeft">
              <div>
                <img src={logos[gameInfo.liveData.boxscore.teams.home.team.name]} alt="" width="100" height="100"></img>
              </div>
              <input
                type="radio"
                name="team[]"
                value={gameInfo.liveData.boxscore.teams.home.team.name}
                onChange={event => setPredictedTeam(event.target.value)}
                required
              />
            </div>
            <div className="floatRight">
              <div>
                <img src={logos[gameInfo.liveData.boxscore.teams.away.team.name]} alt="" width="100" height="100"></img>
              </div>
              <input
                type="radio"
                name="team[]"
                value={gameInfo.liveData.boxscore.teams.away.team.name}
                onChange={event => setPredictedTeam(event.target.value)}
                required
              ></input>
            </div>
          </div>
          <div>
            <button onClick={() => sendPrediction()} disabled={waitingTransaction}>
              Predict {predictedTeam}{' '}
            </button>
          </div>
          {waitingTransaction ? (
            <div>
              <div>
                <b>The transaction is being processed...</b>
              </div>
              <div>
                <ClipLoader color="#fff" loading={true} /*css={override}*/ size={75} />
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

export default SendPredictionModal;
