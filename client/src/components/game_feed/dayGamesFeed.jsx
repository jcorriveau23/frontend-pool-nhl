import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import ClipLoader from 'react-spinners/ClipLoader';

// icons
import { RiInformationFill } from 'react-icons/ri';
import { BiArrowToLeft, BiArrowToRight, BiCurrentLocation } from 'react-icons/bi';

// component
import GameItem from './gameItem';

// css
import './dayGamesFeed.css';
import './react-datepicker.css';

// Loader

export default function DayGamesFeed({
  formatDate,
  setFormatDate,
  todayFormatDate,
  setTodayFormatDate,
  date,
  setDate,
  setGameStatus,
  setDictTeamAgainst,
  selectedGamePk,
}) {
  const [gamesStats, setGamesStats] = useState(null);

  const reset_state = () => {
    setGameStatus('');
    setDictTeamAgainst(null);
    setGamesStats(null);
  };

  const get_day_game_info = async () => {
    if (!date) {
      // this case is when we do a refresh on the site we always display the past date before 12 PM
      const newDate = new Date();

      newDate.setHours(newDate.getHours() - 12); // minus 12 hours, so that before 12pm, yesterday is being shown
      setDate(newDate);

      const newFormatDate = new Date();
      newFormatDate.setHours(newFormatDate.getHours() - newFormatDate.getTimezoneOffset() / 60 - 12); // minus 12 hours so that before 12pm, yesterday is being shown
      setTodayFormatDate(newFormatDate.toISOString().slice(0, 10));
    } else {
      const newDate = new Date(date);

      newDate.setHours(newDate.getHours() - newDate.getTimezoneOffset() / 60);
      const fDate = newDate.toISOString().slice(0, 10);

      setFormatDate(fDate);

      try {
        const res = await axios.get(`/api-rust/daily_games/${fDate}`);
        if (res.data.games.length > 0) {
          let bAllFinal = true;
          let bAllPreview = true;
          let bLiveGames = false;
          const DictTeamAgainst = {};

          for (let i = 0; i < res.data.games.length; i += 1) {
            const game = res.data.games[i];
            const status = game.gameState;

            if (status === 'LIVE') {
              bAllFinal = false;
              bAllPreview = false;
              bLiveGames = true;
            }

            if (status === 'OFF') {
              bAllPreview = false;
              bLiveGames = true;
            }

            if (status === 'FUT') {
              bAllFinal = false;
            }

            DictTeamAgainst[game.awayTeam.id] = game.homeTeam.id;
            DictTeamAgainst[game.homeTeam.id] = game.awayTeam.id;
          }
          setDictTeamAgainst(DictTeamAgainst);

          if (bAllPreview) {
            setGameStatus('Preview');
          } else if (bAllFinal) {
            setGameStatus('Final');
          } else if (bLiveGames) {
            setGameStatus('Live');
          } else {
            setGameStatus('N/A');
          }

          setGamesStats([...res.data.games]);
        } else {
          setGamesStats([]);
          setGameStatus('N/A');
        }
      } catch (e) {
        alert(e.response.data);
      }
    }
  };

  useEffect(() => {
    get_day_game_info();
  }, [date]); // fetch all todays games info from nhl api on this component mount.

  const prevDate = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);

    setDate(newDate);
    reset_state();
  };

  const nextDate = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);

    setDate(newDate);
    reset_state();
  };

  const setSpecificDate = d => {
    setDate(d);
    reset_state();
  };

  const currentDate = () => {
    const newDate = new Date();
    newDate.setHours(newDate.getHours() - 12); // minus 12 hours

    setDate(newDate);
    reset_state();
  };

  const render_game_item = () =>
    gamesStats.length > 0 ? (
      gamesStats.map(game => <GameItem key={game.id} gameData={game} selectedGamePk={selectedGamePk} />)
    ) : (
      <h1>No game on {formatDate}.</h1>
    );

  return (
    <div>
      <div className="inline-block">
        <table className="dateSelector">
          <tbody>
            <tr>
              <td>
                <button className="icon-button" onClick={() => prevDate()} type="button">
                  <BiArrowToLeft size={90} />
                </button>
              </td>
              <td>
                <DatePicker selected={date} onChange={d => setSpecificDate(d)} dateFormat="yyyy-MM-dd" />
              </td>
              <td>
                <button className="icon-button" onClick={() => nextDate()} type="button">
                  <BiArrowToRight size={90} />
                </button>
              </td>
            </tr>
            {todayFormatDate === formatDate ? null : (
              <tr>
                <td colSpan={3}>
                  <a data-tip="The date selected is not the current date.">
                    <RiInformationFill size={70} color="yellow" />
                  </a>
                  <ReactTooltip className="tooltip" padding="8px" />
                  <button className="icon-button" onClick={() => currentDate()} type="button">
                    <BiCurrentLocation size={70} />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="dayGamesFeed">
        <div>
          <ul>{gamesStats ? render_game_item() : <ClipLoader color="#fff" loading size={75} />}</ul>
        </div>
      </div>
    </div>
  );
}
