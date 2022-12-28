import React from 'react';

// component
import DayLeaders from '../components/home_page/dailyLeaders';
import SummaryLeaders from '../components/leagueLeaders_page/summaryLeaders';

export default function HomePage({ formatDate, todayFormatDate, gameStatus, injury }) {
  return (
    <div className="cont">
      <h1>Welcome to hockeypool.live.</h1>
      <h3>It is now live on Kovan Network to connect your wallet and bet some Eth on hockey games.</h3>
      <h3>
        You can also watch live nhl game content, watch your favorite players stats, and create some classic or dynastie
        type pool with your friends. Each months players are allowed to update their roster with their reservists and
        trade are allowed throught the year.
      </h3>
      <SummaryLeaders injury={injury} statsType="points" type="skater" playerType="allSkaters" season="20222023" />
      <SummaryLeaders injury={injury} statsType="wins" type="goalie" playerType="GOnly" season="20222023" />
      <div>
        <DayLeaders formatDate={formatDate} todayFormatDate={todayFormatDate} gameStatus={gameStatus} injury={injury} />
      </div>
    </div>
  );
}
