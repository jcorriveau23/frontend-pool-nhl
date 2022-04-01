import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import axios from 'axios';

// component
import GameItem from './gameItem';

// css
import './dayGamesFeed.css';
import 'react-datepicker/dist/react-datepicker.css';

// icons
import goPrev from '../img/icons/Actions-go-previous-icon.png';
import goNext from '../img/icons/Actions-go-next-icon.png';

export default function TodayGamesFeed({ setFormatDate }) {
  const [gamesStats, setGamesStats] = useState([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const newDate = new Date(date.setHours(0));
    const fDate = newDate.toISOString().slice(0, 10);

    setFormatDate(fDate);
    axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?startDate=${fDate}&endDate=${fDate}`).then(res => {
      if (res.data.dates[0]) {
        setGamesStats([...res.data.dates[0].games]);
      } else {
        setGamesStats([]);
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
                  <img src={goPrev} alt="" />
                </button>
              </td>
              <td>
                <DatePicker selected={date} onChange={d => setDate(d)} dateFormat="P" />
              </td>
              <td>
                <button onClick={nextDate} type="button">
                  <img src={goNext} alt="" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="dayGamesFeed">
        <div>
          <ul>
            {gamesStats.map(game => (
              <Link to={`/game/${game.gamePk}`} key={game.gamePk}>
                <li>
                  <GameItem gameData={game} />
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

TodayGamesFeed.propTypes = { setFormatDate: PropTypes.func.isRequired };
