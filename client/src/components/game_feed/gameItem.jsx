import React from 'react';
import { Link } from 'react-router-dom';

export default function GameItem({ gameData, selectedGamePk }) {
  console.log(gameData);
  const render_game_state = status => {
    switch (status) {
      case 'ON': {
        return gameData && gameData.period && gameData.clock ? (
          <td colSpan={2} style={{ color: '#a20', fontSize: 25 }}>
            {gameData.period} | {gameData.clock.timeRemaining}
          </td>
        ) : (
          <td colSpan={2} style={{ fontSize: 25 }}>
            {new Date(Date.parse(gameData.startTimeUTC)).toLocaleString(navigator.language, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </td>
        );
      }
      case 'PPD': {
        return (
          <td colSpan={2} style={{ color: '#a20', fontSize: 25 }}>
            PPD
          </td>
        );
      }
      case 'OFF': {
        return (
          <td colSpan={2} style={{ color: '#a20', fontSize: 25 }}>
            Final{' '}
            {gameData.periodDescriptor && gameData.periodDescriptor.periodType !== 'REG'
              ? ` (${gameData.periodDescriptor.periodType})`
              : null}
          </td>
        );
      }
      default: {
        return (
          <td colSpan={2} style={{ fontSize: 25 }}>
            {new Date(Date.parse(gameData.startTimeUTC)).toLocaleString(navigator.language, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </td>
        );
      }
    }
  };

  return (
    <Link to={`/game/${gameData.id}`} key={gameData.id}>
      <li style={Number(selectedGamePk) === gameData.id ? { borderColor: '#fff' } : null}>
        <table style={{ width: '150px' }}>
          <thead>
            <tr>{render_game_state(gameData.gameState)}</tr>
          </thead>
          <tbody>
            <tr>
              <td align="left">
                <img src={gameData.awayTeam.logo} alt="" width="70" height="70" />
              </td>
              <td style={{ fontSize: 35 }}>{gameData.awayTeam.score ?? 0}</td>
            </tr>
            <tr>
              <td align="left">
                <img src={gameData.homeTeam.logo} alt="" width="70" height="70" />
              </td>
              <td style={{ fontSize: 35 }}>{gameData.homeTeam.score ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </li>
    </Link>
  );
}
