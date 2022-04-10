import React from 'react';
import PropTypes from 'prop-types';

// component
import DayLeaders from '../components/home_page/daylyLeaders';

export default function HomePage({ formatDate }) {
  return (
    <div className="cont">
      <h1>Welcome to hockeypool.live.</h1>
      <h3>It is now live on Kovan Network to connect your wallet and bet some Eth on hockey games.</h3>
      <h3>You can also watch live nhl game content or watch your favorite players stats.</h3>
      <div>
        <DayLeaders formatDate={formatDate} />
      </div>
    </div>
  );
}

HomePage.propTypes = { formatDate: PropTypes.string.isRequired };
