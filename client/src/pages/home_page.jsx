import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// component
import DayLeaders from '../components/home_page/daylyLeaders';

export default function HomePage({ formatDate }) {
  const [prevFormatDate, setPrevFormatDate] = useState('');
  const [dayLeaders, setDayLeaders] = useState(null);

  useEffect(() => {
    if (formatDate !== prevFormatDate && formatDate) {
      // get the day leaders data from database.

      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', d: formatDate },
      };

      fetch(`https://hockeypool.live/api/pool/get_day_leaders`, requestOptions)
        .then(response => response.json())
        .then(data => {
          if (data.success === 'True') {
            setDayLeaders({ ...data.message });
            setPrevFormatDate(formatDate);
          } else {
            setDayLeaders(null);
            setPrevFormatDate('');
          }
        });
    }
  }, [formatDate]);

  return (
    <div>
      <h1>Welcome to hockeypool.live.</h1>
      <h3>It is now live on Kovan Network to connect your wallet and bet some Eth on hockey games.</h3>
      <h3>You can also watch live nhl game content or watch your favorite players stats.</h3>
      <div>
        <DayLeaders dayLeaders={dayLeaders} formatDate={formatDate} />
      </div>
    </div>
  );
}

HomePage.propTypes = { formatDate: PropTypes.string.isRequired };
