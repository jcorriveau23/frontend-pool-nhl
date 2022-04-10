import React from 'react';
import PropTypes from 'prop-types';

// images
import { logos } from '../img/logos';

import liveGame from '../img/icons/live-game.png';

export default function GameItem({ gameData }) {
  // console.log(gameData)

  const render_game_state = state => {
    if (state === 'Live') {
      return (
        <td>
          <img src={liveGame} alt="" width="40" height="40" />
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
            <img src={logos[gameData.teams.away.team.name]} alt="" width="50" height="50" />
          </td>
          <td>{gameData.teams.away.score}</td>
        </tr>
        <tr>
          <td>
            <img src={logos[gameData.teams.home.team.name]} alt="" width="50" height="50" />
          </td>
          <td>{gameData.teams.home.score}</td>
        </tr>
      </tbody>
    </table>
  );
}

GameItem.propTypes = {
  gameData: PropTypes.shape({
    gameDate: PropTypes.string.isRequired,
    status: PropTypes.shape({ abstractGameState: PropTypes.string.isRequired }).isRequired,
    teams: PropTypes.shape({
      away: PropTypes.shape({
        score: PropTypes.number.isRequired,
        team: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
      }).isRequired,
      home: PropTypes.shape({
        score: PropTypes.number.isRequired,
        team: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
