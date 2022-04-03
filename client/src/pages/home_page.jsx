import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

// component
import DayLeaders from '../components/home_page/daylyLeaders';

export default function HomePage({ formatDate }) {
  const [prevFormatDate, setPrevFormatDate] = useState('');
  const [dayLeaders, setDayLeaders] = useState(null);

  useEffect(() => {
    if (formatDate !== prevFormatDate && formatDate) {
      // get the day leaders data from database.

      axios.get(`/api/pool/get_day_leaders`, { headers: { d: formatDate } }).then(res => {
        if (res.data.success === true) {
          setDayLeaders({ ...res.data.message });
          setPrevFormatDate(formatDate);
        } else {
          setDayLeaders(null);
          setPrevFormatDate('');
        }
      });
    }
  }, [formatDate]);

  return (
    <div className="cont">
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
