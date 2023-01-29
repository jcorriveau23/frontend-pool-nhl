import React from 'react';
import { Link } from 'react-router-dom';

// component
import DayLeaders from '../components/home_page/dailyLeaders';
import SummaryLeaders from '../components/leagueLeaders_page/summaryLeaders';

export default function HomePage({ formatDate, todayFormatDate, gameStatus, injury }) {
  return (
    <div className="cont">
      <div className="information-box">
        <h1>Welcome to hockeypool.live</h1>
        <p>
          Where you can watch live nhl game content, watch your favorite players stats! All the players/teams/games
          information is coming from the nhl api. Nothing is being monetize with this web site.
        </p>
        <h1>We manage pool for you</h1>
        <p>The draft, trades and roster modifications processes are automated. So you have almost nothing to manage.</p>
        <Link to="/pools/jax" style={{ textDecoration: 'none', color: '#000099' }}>
          <h2>demo...</h2>
        </Link>
      </div>
      <SummaryLeaders injury={injury} statsType="points" type="skater" playerType="allSkaters" season="20222023" />
      <SummaryLeaders injury={injury} statsType="wins" type="goalie" playerType="GOnly" season="20222023" />
      <div>
        <DayLeaders formatDate={formatDate} todayFormatDate={todayFormatDate} gameStatus={gameStatus} injury={injury} />
      </div>
    </div>
  );
}
