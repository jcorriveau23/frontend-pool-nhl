import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import liveGame from '../img/icons/live-game.png';

export default function NaviguateToday({ formatDate, setDate, gameStatus, msg, colSpan }) {
  const [todayFormatDate, setTodayFormatDate] = useState(null);
  const [showStatsLabel, setShowStatsLabel] = useState("See today's stats");
  const [title, setTitle] = useState(`Today's ${msg}`);

  useEffect(() => {
    const newDate = new Date();

    if (newDate.getHours() < 12) {
      setShowStatsLabel("See yesterday's stats");
      setTitle(`Yesterday's ${msg}`);
    }

    newDate.setHours(newDate.getHours() - 12); // current date is the past day before 12PM
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);

    setTodayFormatDate(newDate.toISOString().slice(0, 10));
  }, [formatDate]);

  const set_date = () => {
    const newDate = new Date();

    newDate.setHours(newDate.getHours() - 12); // current date is the past day before 12PM
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);

    setDate(newDate);
  };

  return (
    <>
      <tr>
        {formatDate === todayFormatDate ? (
          <th colSpan={colSpan} style={{ color: '#090' }}>
            {title}
          </th>
        ) : (
          <th colSpan={colSpan} style={{ color: '#c20' }}>
            {msg} ({formatDate})
          </th>
        )}
      </tr>
      {formatDate === todayFormatDate ? null : (
        <tr>
          <th colSpan={colSpan}>
            <button className="base-button" onClick={() => set_date()} type="button">
              {gameStatus === 'Live' ? (
                <>
                  <img src={liveGame} alt="" width="40" height="40" />
                  <a>See Live Stats</a>
                </>
              ) : (
                showStatsLabel
              )}
            </button>
          </th>
        </tr>
      )}
    </>
  );
}

NaviguateToday.propTypes = {};
