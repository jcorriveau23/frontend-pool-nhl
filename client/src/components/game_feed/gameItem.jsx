import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// images
import { logos } from '../img/logos';

export default function GameItem({ gameData, selectedGamePk, liveGameInfo }) {
  const render_game_state = status => {
    switch (status.abstractGameState) {
      case 'Live': {
        return liveGameInfo && Number(gameData.gamePk) in liveGameInfo ? (
          <td colSpan={2} style={{ color: '#a20' }}>
            {liveGameInfo[Number(gameData.gamePk)].period} | {liveGameInfo[Number(gameData.gamePk)].time}
          </td>
        ) : (
          <td colSpan={2}>
            {new Date(Date.parse(gameData.gameDate)).toLocaleString(navigator.language, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </td>
        );
      }
      case 'Postponed': {
        return (
          <td colSpan={2} style={{ color: '#a20' }}>
            PPD
          </td>
        );
      }
      case 'Final': {
        return (
          <td colSpan={2} style={{ color: '#a20' }}>
            Final
          </td>
        );
      }
      default: {
        return (
          <td colSpan={2}>
            {new Date(Date.parse(gameData.gameDate)).toLocaleString(navigator.language, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </td>
        );
      }
    }
  };

  return (
    <Link to={`/game/${gameData.gamePk}`} key={gameData.gamePk}>
      <li style={Number(selectedGamePk) === Number(gameData.gamePk) ? { borderColor: '#fff' } : null}>
        <table style={{ width: '100px' }}>
          <thead>
            <tr>{render_game_state(gameData.status)}</tr>
          </thead>
          <tbody>
            <tr>
              <td align="left">
                <img src={logos[gameData.teams.away.team.name]} alt="" width="50" height="50" />
              </td>
              <td>{gameData.teams.away.score}</td>
            </tr>
            <tr>
              <td align="left">
                <img src={logos[gameData.teams.home.team.name]} alt="" width="50" height="50" />
              </td>
              <td>{gameData.teams.home.score}</td>
            </tr>
          </tbody>
        </table>
      </li>
    </Link>
  );
}

GameItem.propTypes = {
  gameData: PropTypes.shape({
    gamePk: PropTypes.string.isRequired,
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
  selectedGamePk: PropTypes.string.isRequired,
};
