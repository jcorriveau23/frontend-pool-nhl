import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import { logos } from '../components/img/logos';

// component
import GamePrediction from '../components/GameBet/gamePrediction';
import GameRecap from '../components/game_feed_page/gameRecap';
import PeriodRecap from '../components/game_feed_page/periodRecap';
import OtherGameContent from '../components/game_feed_page/otherGameContent';

// css
import '../components/react-tabs.css';
import '../components/game_feed_page/goalItem.css';

export default function GameFeedPage({ user, contract }) {
  const [gameInfo, setGameInfo] = useState(null);
  const [gameContent, setGameContent] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [homeRosterPreview, setHomeRosterPreview] = useState(null);
  const [awayRosterPreview, setAwayRosterPreview] = useState(null);
  const [prevGameID, setPrevGameID] = useState('');
  const [homeTeamSkaters, setHomeTeamSkaters] = useState([]);
  const [awayTeamSkaters, setAwayTeamSkaters] = useState([]);
  const location = useLocation();

  const gameID = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (prevGameID !== gameID) {
      setHomeTeamSkaters(null);
      setAwayTeamSkaters(null);

      fetch(`https://statsapi.web.nhl.com/api/v1/game/${gameID}/feed/live`) // https://statsapi.web.nhl.com/api/v1/game/2021020128/feed/live
        .then(response => response.json())
        .then(gInfo => {
          // console.log(gInfo)
          setGameInfo(gInfo);

          if (gInfo.gameData.status.abstractGameState === 'Preview') {
            fetch(`https://statsapi.web.nhl.com/api/v1/teams/${gInfo.gameData.teams.away.id}/roster`) // https://statsapi.web.nhl.com/api/v1/teams/22/roster
              .then(response => response.json())
              .then(teamInfo => {
                setAwayRosterPreview(teamInfo.roster);
              });

            fetch(`https://statsapi.web.nhl.com/api/v1/teams/${gInfo.gameData.teams.home.id}/roster`) // https://statsapi.web.nhl.com/api/v1/teams/22/roster
              .then(response => response.json())
              .then(teamInfo => {
                setHomeRosterPreview(teamInfo.roster);
              });
          } else {
            const homeSkaters = gInfo.liveData.boxscore.teams.home.skaters.filter(key => {
              if (gInfo.liveData.boxscore.teams.home.players[`ID${key}`].stats.skaterStats) return key;
              return null;
            });
            setHomeTeamSkaters(homeSkaters);
            const awaySkaters = gInfo.liveData.boxscore.teams.away.skaters.filter(key => {
              if (gInfo.liveData.boxscore.teams.away.players[`ID${key}`].stats.skaterStats) return key;
              return null;
            });
            setAwayTeamSkaters(awaySkaters);
          }
        });

      fetch(`https://statsapi.web.nhl.com/api/v1/game/${gameID}/content`) // https://statsapi.web.nhl.com/api/v1/game/2021020128/content
        .then(response => response.json())
        .then(gContent => {
          // console.log(gContent)
          setGameContent(gContent);
        });
    }

    setPrevGameID(gameID);
  }, [location]);

  const sort_by_int = (isHome, stat) => {
    let array = [];

    if (isHome) {
      array = homeTeamSkaters.sort((first, second) => {
        if (stat === 'points')
          return (
            gameInfo.liveData.boxscore.teams.home.players[`ID${second}`].stats.skaterStats.goals +
            gameInfo.liveData.boxscore.teams.home.players[`ID${second}`].stats.skaterStats.assists -
            (gameInfo.liveData.boxscore.teams.home.players[`ID${first}`].stats.skaterStats.goals +
              gameInfo.liveData.boxscore.teams.home.players[`ID${first}`].stats.skaterStats.assists)
          );
        return (
          gameInfo.liveData.boxscore.teams.home.players[`ID${second}`].stats.skaterStats[stat] -
          gameInfo.liveData.boxscore.teams.home.players[`ID${first}`].stats.skaterStats[stat]
        );
      });
      setHomeTeamSkaters([...array]);
    } else {
      array = awayTeamSkaters.sort((first, second) => {
        if (stat === 'points')
          return (
            gameInfo.liveData.boxscore.teams.away.players[`ID${second}`].stats.skaterStats.goals +
            gameInfo.liveData.boxscore.teams.away.players[`ID${second}`].stats.skaterStats.assists -
            (gameInfo.liveData.boxscore.teams.away.players[`ID${first}`].stats.skaterStats.goals +
              gameInfo.liveData.boxscore.teams.away.players[`ID${first}`].stats.skaterStats.assists)
          );
        return (
          gameInfo.liveData.boxscore.teams.away.players[`ID${second}`].stats.skaterStats[stat] -
          gameInfo.liveData.boxscore.teams.away.players[`ID${first}`].stats.skaterStats[stat]
        );
      });
      setAwayTeamSkaters([...array]);
    }
  };

  const sort_by_float = (isHome, stat) => {
    let array = [];

    if (isHome) {
      array = homeTeamSkaters.sort(
        (first, second) =>
          parseFloat(gameInfo.liveData.boxscore.teams.home.players[`ID${second}`].stats.skaterStats[stat]) -
          parseFloat(gameInfo.liveData.boxscore.teams.home.players[`ID${first}`].stats.skaterStats[stat])
      );
      setHomeTeamSkaters([...array]);
    } else {
      array = awayTeamSkaters.sort(
        (first, second) =>
          parseFloat(gameInfo.liveData.boxscore.teams.away.players[`ID${second}`].stats.skaterStats[stat]) -
          parseFloat(gameInfo.liveData.boxscore.teams.away.players[`ID${first}`].stats.skaterStats[stat])
      );
      setAwayTeamSkaters([...array]);
    }
  };

  const render_team_stats = (team, isHome) => {
    let skaters;
    if (isHome) skaters = homeTeamSkaters;
    else skaters = awayTeamSkaters;
    // console.log(team.players)
    return (
      <div>
        <table className="content-table">
          <thead>
            <tr>
              <th colSpan={17}>Skaters</th>
            </tr>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>R</th>
              <th onClick={() => sort_by_int(isHome, 'goals')}>G</th>
              <th onClick={() => sort_by_int(isHome, 'assists')}>A</th>
              <th onClick={() => sort_by_int(isHome, 'points')}>P</th>
              <th onClick={() => sort_by_int(isHome, 'plusMinus')}>+/-</th>
              <th onClick={() => sort_by_int(isHome, 'penaltyMinutes')}>PIM</th>
              <th onClick={() => sort_by_int(isHome, 'shots')}>SOG</th>
              <th onClick={() => sort_by_int(isHome, 'hits')}>HITS</th>
              <th onClick={() => sort_by_int(isHome, 'blocked')}>BLKS</th>
              <th onClick={() => sort_by_int(isHome, 'giveaways')}>GVA</th>
              <th onClick={() => sort_by_int(isHome, 'takeaways')}>TKA</th>
              <th onClick={() => sort_by_float(isHome, 'faceOffPct')}>FO%</th>
              <th onClick={() => sort_by_float(isHome, 'timeOnIce')}>TOI</th>
              <th onClick={() => sort_by_float(isHome, 'powerPlayTimeOnIce')}>PP TOI</th>
              <th onClick={() => sort_by_float(isHome, 'shortHandedTimeOnIce')}>SH TOI</th>
            </tr>
          </thead>
          <tbody>
            {skaters.map(key => {
              const keyFormat = `ID${key}`;
              return (
                <tr key={keyFormat}>
                  <td>{team.players[keyFormat].jerseyNumber}</td>
                  <td>
                    <Link
                      to={`/playerInfo/${team.players[keyFormat].person.id}`}
                      style={{ textDecoration: 'none', color: '#000099' }}
                    >
                      {team.players[keyFormat].person.fullName}
                    </Link>
                  </td>
                  <td>{team.players[keyFormat].position.abbreviation}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.goals}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.assists}</td>
                  <td>
                    {team.players[keyFormat].stats.skaterStats.goals +
                      team.players[keyFormat].stats.skaterStats.assists}
                  </td>
                  <td>{team.players[keyFormat].stats.skaterStats.plusMinus}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.penaltyMinutes}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.shots}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.hits}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.blocked}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.giveaways}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.takeaways}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.faceOffPct}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.timeOnIce}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.powerPlayTimeOnIce}</td>
                  <td>{team.players[keyFormat].stats.skaterStats.shortHandedTimeOnIce}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <table className="content-table">
          <thead>
            <tr>
              <th colSpan={9}>Goalie(s)</th>
            </tr>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>R</th>
              <th>TOI</th>
              <th>G</th>
              <th>A</th>
              <th>Shots</th>
              <th>Saves</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {team.goalies.map(key => {
              const keyFormat = `ID${key}`;
              return (
                <tr key={keyFormat}>
                  <td>{team.players[keyFormat].jerseyNumber}</td>
                  <td>
                    <Link
                      to={`/playerInfo/${team.players[keyFormat].person.id}`}
                      style={{ textDecoration: 'none', color: '#000099' }}
                    >
                      {team.players[keyFormat].person.fullName}
                    </Link>
                  </td>
                  <td>{team.players[keyFormat].position.abbreviation}</td>
                  <td>{team.players[keyFormat].stats.goalieStats.timeOnIce}</td>
                  <td>{team.players[keyFormat].stats.goalieStats.goals}</td>
                  <td>{team.players[keyFormat].stats.goalieStats.assists}</td>
                  <td>{team.players[keyFormat].stats.goalieStats.shots}</td>
                  <td>{team.players[keyFormat].stats.goalieStats.saves}</td>
                  <td>
                    {Math.round((team.players[keyFormat].stats.goalieStats.savePercentage + Number.EPSILON) * 100) /
                      100}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const render_team_roster = roster => (
    <div>
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan={17}>Skaters</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>R</th>
          </tr>
        </thead>
        <tbody>
          {roster.map(player => (
            <tr key={player.person.id}>
              <td>{player.jerseyNumber}</td>
              <td>
                <Link to={`/playerInfo/${player.person.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                  {player.person.fullName}
                </Link>
              </td>
              <td>{player.position.abbreviation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const render_game_stats = (teams, linescores) => {
    if (teams.away.teamStats.teamSkaterStats) {
      return (
        <table className="goalItem">
          <thead>
            <tr>
              <th>
                <img src={logos[teams.away.team.name]} alt="" width="30" height="30" />
              </th>
              <th>Summary</th>
              <th>
                <img src={logos[teams.home.team.name]} alt="" width="30" height="30" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{linescores.teams.away.goals}</td>
              <th>Goals</th>
              <td>{linescores.teams.home.goals}</td>
            </tr>
            <tr>
              <td>{teams.away.teamStats.teamSkaterStats.shots}</td>
              <th>Shots on Goal</th>
              <td>{teams.home.teamStats.teamSkaterStats.shots}</td>
            </tr>
            <tr>
              <td>{teams.away.teamStats.teamSkaterStats.faceOffWinPercentage}</td>
              <th>Faceoff %</th>
              <td>{teams.home.teamStats.teamSkaterStats.faceOffWinPercentage}</td>
            </tr>
            <tr>
              <td>
                {`${teams.away.teamStats.teamSkaterStats.powerPlayGoals} / ${teams.away.teamStats.teamSkaterStats.powerPlayOpportunities}`}
              </td>
              <th>Power Play</th>
              <td>
                {`${teams.home.teamStats.teamSkaterStats.powerPlayGoals} / ${teams.home.teamStats.teamSkaterStats.powerPlayOpportunities}`}
              </td>
            </tr>
            <tr>
              <td>{teams.away.teamStats.teamSkaterStats.pim}</td>
              <th>PIM</th>
              <td>{teams.home.teamStats.teamSkaterStats.pim}</td>
            </tr>
            <tr>
              <td>{teams.away.teamStats.teamSkaterStats.hits}</td>
              <th>Hits</th>
              <td>{teams.home.teamStats.teamSkaterStats.hits}</td>
            </tr>

            <tr>
              <td>{teams.away.teamStats.teamSkaterStats.blocked}</td>
              <th>Blocks</th>
              <td>{teams.home.teamStats.teamSkaterStats.blocked}</td>
            </tr>

            <tr>
              <td>{teams.away.teamStats.teamSkaterStats.giveaways}</td>
              <th>Giveaways</th>
              <td>{teams.home.teamStats.teamSkaterStats.giveaways}</td>
            </tr>

            <tr>
              <td>{teams.away.teamStats.teamSkaterStats.takeaways}</td>
              <th>Takeaways</th>
              <td>{teams.home.teamStats.teamSkaterStats.takeaways}</td>
            </tr>
          </tbody>
        </table>
      );
    }

    return null;
  };

  const render_Shootout_result = shot => {
    if (shot.result.event === 'Shot') {
      return (
        <td>
          <b style={{ color: '#ee0000' }}>Missed</b>
        </td>
      );
    }
    if (shot.result.event === 'Goal') {
      return (
        <td>
          <b style={{ color: '#008800' }}>Goal</b>
        </td>
      );
    }

    return null;
  };

  const render_shootout = liveData => (
    <table className="goalItem">
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
        {liveData.plays.playsByPeriod[4].plays.map(i => {
          if (
            liveData.plays.allPlays[i].result.event === 'Shot' ||
            liveData.plays.allPlays[i].result.event === 'Goal'
          ) {
            return (
              <tr key={i}>
                <td>
                  <img src={logos[liveData.plays.allPlays[i].team.name]} alt="" width="30" height="30" />
                </td>
                <td>
                  <Link
                    to={`/playerInfo/${liveData.plays.allPlays[i].players[0].player.id}`}
                    style={{ textDecoration: 'none', color: '#000099' }}
                  >
                    {liveData.plays.allPlays[i].players[0].player.fullName}
                  </Link>
                </td>
                {render_Shootout_result(liveData.plays.allPlays[i])}
              </tr>
            );
          }
          return null;
        })}
      </tbody>
    </table>
  );

  const render_roster = (teamRosterPreview, teamRosterStats, isHome) => {
    if (gameInfo.gameData.status.abstractGameState === 'Preview') {
      if (teamRosterPreview) return render_team_roster(teamRosterPreview);
    } else if (teamRosterStats) {
      if (isHome) {
        return render_team_stats(gameInfo.liveData.boxscore.teams.home, isHome);
      }
      return render_team_stats(gameInfo.liveData.boxscore.teams.away, isHome);
    }

    return null;
  };

  if (gameInfo && gameContent) {
    return (
      <div>
        <div>
          <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
            <TabList>
              <Tab>Game stats</Tab>
              <Tab>Game recap</Tab>
              <Tab>
                <img src={logos[gameInfo.liveData.boxscore.teams.home.team.name]} alt="" width="30" height="30" />
              </Tab>
              <Tab>
                <img src={logos[gameInfo.liveData.boxscore.teams.away.team.name]} alt="" width="30" height="30" />
              </Tab>
              {contract ? <Tab>Prediction Market</Tab> : null}
            </TabList>
            <TabPanel>{render_game_stats(gameInfo.liveData.boxscore.teams, gameInfo.liveData.linescore)}</TabPanel>
            <TabPanel>
              <div>
                <Tabs>
                  <TabList>
                    <Tab>Short Recap</Tab>
                    <Tab>Long Recap</Tab>
                  </TabList>
                  <TabPanel>
                    <div className="min-width">
                      <GameRecap gameContent={gameContent} isEditorial />
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div>
                      <GameRecap gameContent={gameContent} isEditorial={false} />
                    </div>
                  </TabPanel>
                </Tabs>
              </div>
            </TabPanel>
            <TabPanel>
              <>{render_roster(homeRosterPreview, homeTeamSkaters, true)}</>
            </TabPanel>
            <TabPanel>
              <>{render_roster(awayRosterPreview, awayTeamSkaters, false)}</>
            </TabPanel>
            {contract ? (
              <TabPanel>
                <div>
                  <GamePrediction gameID={gameID} gameInfo={gameInfo} user={user} contract={contract} />
                </div>
              </TabPanel>
            ) : null}
          </Tabs>
          <div>
            {gameInfo.gameData.status.abstractGameState !== 'Preview' ? (
              <>
                <PeriodRecap gameInfo={gameInfo} gameContent={gameContent} period="1" />
                <PeriodRecap gameInfo={gameInfo} gameContent={gameContent} period="2" />
                <PeriodRecap gameInfo={gameInfo} gameContent={gameContent} period="3" />
                <PeriodRecap gameInfo={gameInfo} gameContent={gameContent} period="4" />
                {gameInfo.liveData.linescore.hasShootout ? render_shootout(gameInfo.liveData) : null}
                <OtherGameContent gameContent={gameContent} />
              </>
            ) : (
              <h1>Game not started yet.</h1>
            )}
          </div>
          {/* <h1>{gameInfo.liveData.plays.currentPlay.about.goals.away}</h1>
                    <h1>{gameInfo.liveData.plays.currentPlay.about.goals.home}</h1> */}
        </div>
      </div>
    );
  }
  return (
    <div>
      <h1>Trying to fetch game data from nhl api...</h1>
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}

GameFeedPage.propTypes = {
  user: PropTypes.shape({ addr: PropTypes.string.isRequired }),
  contract: PropTypes.shape({}),
};

GameFeedPage.defaultProps = {
  contract: null,
  user: null,
};
