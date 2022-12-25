import React, { useState, useEffect } from 'react';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

export default function BetItem({ contract, gameID }) {
  const [gameData, setGameData] = useState(null);

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
          setGameData(gData);
        });
    });
  }, []);

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
            <th> </th>
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
  }

  return <ClipLoader color="#fff" loading size={75} />;
}
