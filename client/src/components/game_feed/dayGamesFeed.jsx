import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import ClipLoader from 'react-spinners/ClipLoader';

// icons
import { RiInformationFill } from 'react-icons/ri';
import goPrev from '../img/icons/Actions-go-previous-icon.png';
import goNext from '../img/icons/Actions-go-next-icon.png';

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
  const [liveGameInfo, setLiveGameInfo] = useState(null);

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
      axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${fDate}&endDate=${fDate}`).then(res => {
        if (res.data.dates[0]) {
          // console.log(res.data.dates[0]);
          axios.get('/live_game_info.json').then(res2 => {
            // console.log(res2.data);
            setLiveGameInfo(res2.data);
          });

          let bAllFinal = true;
          let bAllPreview = true;
          let bLiveGames = false;
          const DictTeamAgainst = {};

          for (let i = 0; i < res.data.dates[0].games.length; i += 1) {
            if (res.data.dates[0].games[i].status.detailedState !== 'Postponed') {
              const status = res.data.dates[0].games[i].status.abstractGameState;

              if (status === 'Live') {
                bAllFinal = false;
                bAllPreview = false;
                bLiveGames = true;
              }

              if (status === 'Final') {
                bAllPreview = false;
                bLiveGames = true;
              }

              if (status === 'Preview') {
                bAllFinal = false;
              }

              DictTeamAgainst[res.data.dates[0].games[i].teams.away.team.id] =
                res.data.dates[0].games[i].teams.home.team.id;
              DictTeamAgainst[res.data.dates[0].games[i].teams.home.team.id] =
                res.data.dates[0].games[i].teams.away.team.id;
            }
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

          setGamesStats([...res.data.dates[0].games]);
        } else {
          setGamesStats([]);
          setGameStatus('N/A');
        }
      });
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
      gamesStats.map(game => (
        <GameItem key={game.gamePk} gameData={game} selectedGamePk={selectedGamePk} liveGameInfo={liveGameInfo} />
      ))
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
                <button onClick={() => prevDate()} type="button">
                  <img src={goPrev} alt="" width={60} height={60} />
                </button>
              </td>
              <td>
                <DatePicker selected={date} onChange={d => setSpecificDate(d)} dateFormat="yyyy-MM-dd" />
              </td>
              <td>
                <button onClick={() => nextDate()} type="button">
                  <img src={goNext} alt="" width={60} height={60} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        {todayFormatDate === formatDate ? null : (
          <div>
            <table>
              <tbody>
                <tr>
                  <td>
                    <a data-tip="The date selected is not the current date.">
                      <RiInformationFill size={45} color="yellow" />
                    </a>
                    <ReactTooltip className="tooltip" padding="8px" />
                  </td>
                  <td>
                    <button type="button" onClick={currentDate} className="base-button">
                      Set Current Date...
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="dayGamesFeed">
        <div>
          <ul>{gamesStats ? render_game_item() : <ClipLoader color="#fff" loading size={75} />}</ul>
        </div>
      </div>
    </div>
  );
}
