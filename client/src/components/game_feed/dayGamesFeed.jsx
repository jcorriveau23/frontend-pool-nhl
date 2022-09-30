import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import axios from 'axios';

// component
import GameItem from './gameItem';

// css
import './dayGamesFeed.css';
import './react-datepicker.css';

// icons
import goPrev from '../img/icons/Actions-go-previous-icon.png';
import goNext from '../img/icons/Actions-go-next-icon.png';

export default function TodayGamesFeed({
  formatDate,
  setFormatDate,
  date,
  setDate,
  setGameStatus,
  setDictTeamAgainst,
}) {
  const [gamesStats, setGamesStats] = useState([]);

  useEffect(() => {
    let newDate;

    if (!formatDate) {
      // this case is when we do a refresh on the site we always display the past date before 12 PM
      newDate = new Date();
      newDate.setHours(date.getHours() - 12);
      newDate.setHours(0);
      newDate.setMinutes(0);
      newDate.setSeconds(0);
      setDate(newDate);
    } else {
      newDate = new Date(date);
    }

    const fDate = newDate.toISOString().slice(0, 10);

    setFormatDate(fDate);
    axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${fDate}&endDate=${fDate}`).then(res => {
      if (res.data.dates[0]) {
        let bAllFinal = true;
        let bAllPreview = true;
        let bLiveGames = false;
        let DictTeamAgainst = {};

        for (let i = 0; i < res.data.dates[0].games.length; i += 1) {
          if (res.data.dates[0].games[i].status.detailedState === 'Postponed') continue;
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

          DictTeamAgainst[res.data.dates[0].games[i].teams.away.team.name] =
            res.data.dates[0].games[i].teams.home.team.name;
          DictTeamAgainst[res.data.dates[0].games[i].teams.home.team.name] =
            res.data.dates[0].games[i].teams.away.team.name;
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
  }, [date]); // fetch all todays games info from nhl api on this component mount.

  const prevDate = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);

    setDate(newDate);
  };

  const nextDate = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);

    setDate(newDate);
  };

  return (
    <div>
      <div className="dateSelector">
        <table>
          <tbody>
            <tr>
              <td>
                <button onClick={prevDate} type="button">
                  <img src={goPrev} alt="" width={60} height={60} />
                </button>
              </td>
              <td>
                <DatePicker selected={date} onChange={d => setDate(d)} dateFormat="yyyy-MM-dd" />
              </td>
              <td>
                <button onClick={nextDate} type="button">
                  <img src={goNext} alt="" width={60} height={60} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="dayGamesFeed">
        <div>
          <ul>
            {gamesStats && gamesStats.length > 0 ? (
              gamesStats.map(game => (
                <Link to={`/game/${game.gamePk}`} key={game.gamePk}>
                  <li>
                    <GameItem gameData={game} />
                  </li>
                </Link>
              ))
            ) : (
              <h1>No game on that day.</h1>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

TodayGamesFeed.propTypes = { formatDate: PropTypes.string.isRequired, setFormatDate: PropTypes.func.isRequired };
