import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useParams } from 'react-router-dom';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import { team_info, abbrevToTeamId } from '../components/img/logos';

// component
import GamePrediction from '../components/GameBet/gamePrediction';
import GameRecap from '../components/game_feed_page/gameRecap';
import PeriodRecap from '../components/game_feed_page/periodRecap';
import PlayerLink from '../components/playerLink';
import BoxScore from '../components/game_feed_page/boxScore';

// css
import '../components/react-tabs.css';
import '../components/game_feed_page/goalItem.css';

export default function GameFeedPage({ user, contract, injury, setSelectedGamePk }) {
  const [gameInfo, setGameInfo] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const { id } = useParams();

  const get_game_landing = async () => {
    try {
      const res = await axios.get(`/api-rust/game/landing/${id}`);
      setGameInfo(res.data);
    } catch (e) {
      setIsError(true);
    }
  };

  useEffect(() => {
    if (id) {
      setSelectedGamePk(id);
      get_game_landing();
    }

    return () => {
      // leaving game page. Reset all components state.
      setGameInfo(null);
      setSelectedGamePk(null);
    };
  }, [id]);

  const render_game_stats = () => {
    if (gameInfo.summary.teamGameStats) {
      return (
        <table className="goal-item">
          <thead>
            <tr>
              {/* <th colSpan={3}>
                {linescores.currentPeriodOrdinal} | {linescores.currentPeriodTimeRemaining}
              </th> */}
            </tr>
            <tr>
              <th>
                <img src={gameInfo.awayTeam.logo} alt="" width="70" height="70" />
              </th>
              <th>Summary</th>
              <th>
                <img src={gameInfo.homeTeam.logo} alt="" width="70" height="70" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontSize: 60 }}>{gameInfo.awayTeam.score}</td>
              <th>Goals</th>
              <td style={{ fontSize: 60 }}>{gameInfo.homeTeam.score}</td>
            </tr>
            {gameInfo.summary.teamGameStats.map(stats => (
              <tr>
                <td>{stats.awayValue}</td>
                <th>{stats.category}</th>
                <td>{stats.homeValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  const render_Shootout_result = shootout => {
    if (shootout.result === 'goal') {
      return (
        <td>
          <b style={{ color: '#008800' }}>Goal</b>
        </td>
      );
    }

    return (
      <td>
        <b style={{ color: '#ee0000' }}>Missed</b>
      </td>
    );
  };

  const render_shootout = shootouts => (
    <table className="goal-item">
      <thead>
        <tr>
          <th colSpan={3}>Shootout results</th>
        </tr>
        <tr>
          <th>Team</th>
          <th>Shooter</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        {shootouts.map(shootout => (
          <tr key={shootout.sequence}>
            <td>
              <img src={team_info[abbrevToTeamId[shootout.teamAbbrev]]?.logo} alt="" width="40" height="40" />
            </td>
            <td>
              <PlayerLink name={`${shootout.firstName} ${shootout.lastName}`} id={shootout.playerId} injury={injury} />
            </td>
            {render_Shootout_result(shootout)}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (gameInfo) {
    return (
      <div className="cont">
        <div>
          <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
            <TabList>
              <Tab>Game stats</Tab>
              <Tab>Box score</Tab>
              <Tab>Game recap</Tab>
              {contract ? <Tab>Prediction Market</Tab> : null}
            </TabList>
            <TabPanel>{render_game_stats()}</TabPanel>
            <TabPanel>
              <BoxScore gameId={gameInfo.id} />
            </TabPanel>
            <TabPanel>
              <div>
                <Tabs>
                  <TabList>
                    <Tab>Short Recap</Tab>
                    <Tab>Long Recap</Tab>
                  </TabList>
                  {/* <TabPanel>
                    <div className="min-width">
                      <GameRecap gameContent={gameContent} isEditorial />
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div className="min-width">
                      <GameRecap gameContent={gameContent} isEditorial={false} />
                    </div>
                  </TabPanel> */}
                </Tabs>
              </div>
            </TabPanel>

            {contract ? (
              <TabPanel>
                <div>
                  <GamePrediction gameID={id} gameInfo={gameInfo} user={user} contract={contract} />
                </div>
              </TabPanel>
            ) : null}
          </Tabs>
          <div>
            {gameInfo.summary.scoring?.length > 0 ? (
              <>
                <PeriodRecap scoring={gameInfo.summary.scoring} />
                {gameInfo.summary.shootout?.length ? render_shootout(gameInfo.summary.shootout) : null}
              </>
            ) : (
              <h1>No goal has been scored yet.</h1>
            )}
          </div>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="cont">
        <h1>No game information exist yet.</h1>
      </div>
    );
  }
  return (
    <div className="cont">
      <h1>Trying to fetch game data from nhl api...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
