import React, { useState, useEffect } from 'react';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

function BetItem({ user, contract, gameID }) {
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    contract.predictionGames(parseInt(gameID)).then(g => {
      let gData = {
        accumulatedWeisHome: parseInt(g.accumulatedWeisHome),
        accumulatedWeisAway: parseInt(g.accumulatedWeisAway),
        isDone: g.isDone,
        isCreated: g.isCreated,
        isHomeWin: g.isHomeWin,
        predictByMeWeisHome: 0,
        predictByMeWeisAway: 0,
      };

      contract
        .get_user_bet_amount(parseInt(gameID))
        .then(values => {
          gData.predictByMeWeisHome = parseInt(values[0]);
          gData.predictByMeWeisAway = parseInt(values[1]);
          setGameData(gData);
        })
        .catch(e => {
          setGameData(gData);
        });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (gameData) {
    return (
      <table>
        <thead>
          <tr>
            {/* <td>{new Date(Date.parse(gameData.gameDate)).toLocaleString(navigator.language, {hour: '2-digit', minute:'2-digit'})}</td> */}
          </tr>
          <tr>
            <th colSpan={3}>{gameID}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th></th>
            <th>Home</th>
            <th>Away</th>
          </tr>
          <tr>
            <th>Amount in pool</th>
            <td>{gameData.accumulatedWeisHome / 10 ** 18}</td>
            <td>{gameData.accumulatedWeisAway / 10 ** 18}</td>
          </tr>
          <tr>
            <th>Your part (Ethers)</th>
            <td>{gameData.predictByMeWeisHome / 10 ** 18}</td>
            <td>{gameData.predictByMeWeisAway / 10 ** 18}</td>
          </tr>
          <tr>
            <th>Your part (%)</th>
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
    );
  } else return <ClipLoader color="#fff" loading={true} /*css={override}*/ size={75} />;
}

export default BetItem;
