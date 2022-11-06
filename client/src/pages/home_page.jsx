import React from 'react';
import PropTypes from 'prop-types';

// component
import DayLeaders from '../components/home_page/dailyLeaders';

export default function HomePage({ formatDate, todayFormatDate, gameStatus, injury }) {
  return (
    <div className="cont">
      <h1>Welcome to hockeypool.live.</h1>
      <h3>It is now live on Kovan Network to connect your wallet and bet some Eth on hockey games.</h3>
      <h3>
        You can also watch live nhl game content, watch your favorite players stats, and create some dynatie type pool
        with your friends.
      </h3>
      <div>
        <DayLeaders formatDate={formatDate} todayFormatDate={todayFormatDate} gameStatus={gameStatus} injury={injury} />
      </div>
    </div>
  );
}

HomePage.propTypes = { formatDate: PropTypes.string.isRequired };
