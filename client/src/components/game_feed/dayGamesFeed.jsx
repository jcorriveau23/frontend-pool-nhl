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
  const [liveGameInfo, setLiveGameInfo] = useState(null);

  const reset_state = () => {
    setGameStatus('');
    setDictTeamAgainst(null);
    setGamesStats(null);
  };

  const get_live_game_info = async () => {
    try {
      const res = await axios.get('/live_game_info.json');
      // console.log(res.data);
      setLiveGameInfo(res.data);
    } catch (e) {
      alert(e);
    }
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
        const res = await axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${fDate}&endDate=${fDate}`);
        if (res.data.dates[0]) {
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
      } catch (e) {
        alert(e);
      }
    }
  };

  useEffect(() => {
    get_live_game_info();
  }, []);

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
                <BiArrowToLeft size={90} color="#999" className="icon-link" onClick={() => prevDate()} />
              </td>
              <td>
                <DatePicker selected={date} onChange={d => setSpecificDate(d)} dateFormat="yyyy-MM-dd" />
              </td>
              <td>
                <BiArrowToRight size={90} color="#999" className="icon-link" onClick={() => nextDate()} />
              </td>
            </tr>
            {todayFormatDate === formatDate ? null : (
              <tr>
                <td colSpan={3}>
                  <a data-tip="The date selected is not the current date.">
                    <RiInformationFill size={70} color="yellow" />
                  </a>
                  <ReactTooltip className="tooltip" padding="8px" />
                  <BiCurrentLocation size={70} color="#999" className="icon-link" onClick={() => currentDate()} />
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
