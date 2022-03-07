import React from 'react';

// teams logo
import logos from '../img/logos';

import liveGame from '../img/icons/live-game.png';

function GameItem({ gameData }) {
  // console.log(gameData)

  const render_game_state = state => {
    if (state === 'Live') {
      return (
        <td>
          <img src={liveGame} alt="" />
        </td>
      );
    }
    if (state === 'Postponed') {
      return <td>PPD</td>;
    }

    return null;
  };

  return (
    <table>
      <thead>
        <tr>
          <td>
            {new Date(Date.parse(gameData.gameDate)).toLocaleString(navigator.language, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </td>
          <td />
          {render_game_state(gameData.status.abstractGameState)}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <img src={logos[gameData.teams.away.team.name]} alt="" width="30" height="30" />
          </td>
          <td>{gameData.teams.away.score}</td>
        </tr>
        <tr>
          <td>
            <img src={logos[gameData.teams.home.team.name]} alt="" width="30" height="30" />
          </td>
          <td>{gameData.teams.home.score}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default GameItem;
