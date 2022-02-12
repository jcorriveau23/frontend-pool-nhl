import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// component
import { GameItem } from './gameItem';
import DatePicker from 'react-datepicker';

// css
import './dayGamesFeed.css';
import 'react-datepicker/dist/react-datepicker.css';

// icons
import goPrev from '../img/icons/Actions-go-previous-icon.png';
import goNext from '../img/icons/Actions-go-next-icon.png';

function TodayGamesFeed() {
  const [gamesStats, setGamesStats] = useState([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const newDate = new Date(date.setHours(0));
    var formatDate = newDate.toISOString().slice(0, 10);

    fetch(
      'https://statsapi.web.nhl.com/api/v1/schedule?startDate=' +
        formatDate +
        '&endDate=' +
        formatDate
    )
      .then(response => response.json())
      .then(todayGamesData => {
        if (todayGamesData.dates[0]) {
          setGamesStats([...todayGamesData.dates[0].games]);
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
                <img src={goPrev} onClick={prevDate} alt=""></img>
              </td>
              <td>
                <DatePicker
                  selected={date}
                  onChange={date => setDate(date)}
                  dateFormat="P"
                ></DatePicker>
              </td>
              <td>
                <img src={goNext} onClick={nextDate} alt=""></img>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="dayGamesFeed">
        <ul>
          {gamesStats.map((game, i) => {
            return (
              <Link to={'/gameFeed/' + game.gamePk} key={i}>
                <li>
                  <GameItem gameData={game}></GameItem>
                </li>
              </Link>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default TodayGamesFeed;
