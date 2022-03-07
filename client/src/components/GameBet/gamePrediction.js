import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

// chart
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// modals
import SendPredictionModal from '../../modals/sendPrediction';

Chart.register(ArcElement, Tooltip, Legend);

function GamePrediction({ gameID, gameInfo, user, contract }) {
  const [gameData, setGameData] = useState(null);
  const [showSendPredictionModal, setShowSendPredictionModal] = useState(false);
  const [reRender, setReRender] = useState(false);
  const [owner, setOwner] = useState('');

  useEffect(() => {
    contract.predictionGames(parseInt(gameID, 10)).then(g => {
      const gData = {
        accumulatedWeisHome: parseInt(g.accumulatedWeisHome, 10),
        accumulatedWeisAway: parseInt(g.accumulatedWeisAway, 10),
        isDone: g.isDone,
        isCreated: g.isCreated,
        isHomeWin: g.isHomeWin,
        predictByMeWeisHome: 0,
        predictByMeWeisAway: 0,
      };

      contract
        .get_user_bet_amount(parseInt(gameID, 10))
        .then(values => {
          gData.predictByMeWeisHome = parseInt(values[0], 10);
          gData.predictByMeWeisAway = parseInt(values[1], 10);
          setGameData(gData);
        })
        .catch(e => {
          console.log(e);
          setGameData(gData); // the user does not have bet yet in this pool.
        });

      contract.owner().then(o => {
        setOwner(o);
      });
    });
  }, [gameID, reRender]);

  const create_prediction_market = async () => {
    const overrides = {
      gasLimit: 120000, // optional
    };

    await contract.createGame(gameInfo.gamePk, overrides);
  };

  if (gameData && gameInfo) {
    if (gameData.isCreated) {
      return (
        <div>
          {showSendPredictionModal ? (
            <SendPredictionModal
              user={user}
              gameID={gameID}
              gameInfo={gameInfo}
              gamedata={gameData}
              contract={contract}
              showSendPredictionModal={showSendPredictionModal}
              setShowSendPredictionModal={setShowSendPredictionModal}
              reRender={reRender}
              setRerender={setReRender}
            />
          ) : null}
          <div style={{ width: 300, height: 300 }}>
            <Pie
              data={{
                labels: [
                  gameInfo.liveData.boxscore.teams.home.team.name,
                  gameInfo.liveData.boxscore.teams.away.team.name,
                ],
                datasets: [
                  {
                    label: 'Eth',
                    data: [gameData.accumulatedWeisHome / 10 ** 18, gameData.accumulatedWeisAway / 10 ** 18], // from Weis to Ethers
                    backgroundColor: ['rgba(255,99,132,0.2)', 'rgba(54,162,235,0.2)'],
                    borderColor: ['rgba(255,99,132,1)', 'rgba(54,162,235,1)'],
                    borderWidth: 3,
                  },
                ],
              }}
            />
          </div>
          <div>
            <button onClick={() => setShowSendPredictionModal(true)} disabled={gameData.isDone} type="button">
              {gameData.isDone ? 'Game is done' : 'Predict'}
            </button>
          </div>
          <div>
            <table className="content-table">
              <thead>
                <tr>
                  <th> </th>
                  <th>{gameInfo.liveData.boxscore.teams.home.team.name}</th>
                  <th>{gameInfo.liveData.boxscore.teams.away.team.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Pool amount (Ethers)</th>
                  <td>{gameData.accumulatedWeisHome / 10 ** 18}</td>
                  <td>{gameData.accumulatedWeisAway / 10 ** 18}</td>
                </tr>
                <tr>
                  <th>Invested by me (Ethers)</th>
                  <td>{gameData.predictByMeWeisHome / 10 ** 18}</td>
                  <td>{gameData.predictByMeWeisAway / 10 ** 18}</td>
                </tr>
                <tr>
                  <th>My part (%)</th>
                  <td>
                    {gameData.accumulatedWeisHome !== 0
                      ? (gameData.predictByMeWeisHome / gameData.accumulatedWeisHome) * 100
                      : '-'}
                  </td>
                  <td>
                    {gameData.accumulatedWeisAway !== 0
                      ? (gameData.predictByMeWeisAway / gameData.accumulatedWeisAway) * 100
                      : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h1>No Prediction market open for that game yet.</h1>
        {contract && user && user.addr === owner ? (
          <button onClick={create_prediction_market} type="button">
            Create
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <h1>Trying to fetch Prediction game info from the smart contract.</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

export default GamePrediction;
