import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import { logos } from '../components/img/logos';

export default function PlayerPage() {
  const [playerStats, setPlayerStats] = useState(null);
  const [playerPlayoffStats, setPlayerPlayoffStats] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [prospectInfo, setProspectInfo] = useState(null);
  const [prevPlayerID, setPrevPlayerID] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [hasNavigated, setHaseNavigated] = useState(false);

  const playerID = window.location.pathname.split('/').pop();

  useEffect(() => {
    const ID = parseInt(playerID, 10);

    if (prevPlayerID !== playerID && !Number.isNaN(ID)) {
      if (ID > 8000000) {
        // console.log("fetching NHL player")
        axios
          .get(`https://statsapi.web.nhl.com/api/v1/people/${playerID}/stats?stats=yearByYear`) // https://statsapi.web.nhl.com/api/v1/people/8475726/stats?stats=yearByYear
          .then(res => {
            // console.log(p)
            setPlayerStats(res.data);
          });
        axios
          .get(`https://statsapi.web.nhl.com/api/v1/people/${playerID}/stats?stats=yearByYearPlayoffs`) // https://statsapi.web.nhl.com/api/v1/people/8475726/stats?stats=yearByYearPlayoffs
          .then(res => {
            // console.log(p)
            setPlayerPlayoffStats(res.data);
          });
        axios
          .get(`https://statsapi.web.nhl.com/api/v1/people/${playerID}`) // https://statsapi.web.nhl.com/api/v1/people/8475726/stats?stats=yearByYear
          .then(res => {
            setPlayerInfo(res.data);
          });
      } else {
        // console.log("fetching prospect")
        axios
          .get(`https://statsapi.web.nhl.com/api/v1/draft/prospects/${playerID}`) // https://statsapi.web.nhl.com/api/v1/draft/prospects/76849
          .then(res => {
            setProspectInfo({ ...res.data.prospects[0] });
            // console.log(p.prospects[0])
            if (res.data.prospects[0].nhlPlayerId > 8000000 && !hasNavigated) {
              setHaseNavigated(true);
              navigate(`/player-info/${res.data.prospects[0].nhlPlayerId}`);
            }
          });
      }
      setPrevPlayerID(playerID);
    } else {
      setPlayerInfo(null);
      setPlayerStats(null);
      setProspectInfo(null);
      setPrevPlayerID('');
    }
  }, [location]);

  const get_league_row_color = leagueName => {
    switch (leagueName) {
      case 'National Hockey League':
        return '#ffd68c';
      case 'AHL':
      case 'Can-Am':
        return '#f5abab';
      case 'Swiss':
      case 'Russia':
      case 'Finland':
      case 'Czechia':
      case 'Rus-KHL':
      case 'KHL':
        return '#a3cf97';
      case 'ECAC':
      case 'NCAA':
      case 'CCHA':
        return '#bfb8e7';
      case 'CJHL':
      case 'OPJHL':
      case 'QJHL':
        return '#cce2ff';
      case 'WHL':
      case 'QMJHL':
      case 'OHL':
        return '#b2d4ff';
      case 'ECHL':
        return '#ffbfbf';
      case 'Czechia2':
      case 'Czech':
        return '#c7e2c0';
      case 'QSHL':
      case 'QMHL':
        return '#e9e3ba';
      default:
        return null;
    }
  };

  const get_playoff_stats = season => {
    for (let i = 0; i < playerPlayoffStats.stats[0].splits.length; i += 1) {
      if (
        playerPlayoffStats.stats[0].splits[i].season === season.season &&
        playerPlayoffStats.stats[0].splits[i].league.name === season.league.name
      ) {
        return playerPlayoffStats.stats[0].splits[i];
      }
    }
    return null;
  };

  const render_skater_stats = stats => {
    let totGames = 0;
    let totGoals = 0;
    let totAssists = 0;
    let totPoints = 0;
    let totPlusMinus = 0;
    let totPenaltyMinutes = 0;
    // let totShots = 0
    // let totHits = 0
    // let totBlocks = 0
    // let totPPG = 0
    let playoffTotGames = 0;
    let playoffTotGoals = 0;
    let playoffTotAssists = 0;
    let playoffTotPoints = 0;
    let playoffTotPlusMinus = 0;
    let playoffTotPenaltyMinutes = 0;

    return (
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan="15">Career Stats</th>
          </tr>
          <tr>
            <th colSpan="3">{null}</th>
            <th colSpan="6">Regular Season</th>
            <th colSpan="6">Playoffs</th>
          </tr>
          <tr>
            <th>Team</th>
            <th>Season</th>
            <th>League</th>
            <th>Games</th>
            <th>G</th>
            <th>A</th>
            <th>P</th>
            <th>+/-</th>
            <th>PIM</th>
            {/* <th>S</th>
                <th>S%</th>
                <th>HITS</th>
                <th>BLKS</th>
                <th>PPG</th>
                <th>FO%</th>
                <th>TOI</th>
                <th>PP TOI</th>
                <th>SH TOI</th> */}
            <th>Games</th>
            <th>G</th>
            <th>A</th>
            <th>P</th>
            <th>+/-</th>
            <th>PIM</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(season => {
            const playoffStats = get_playoff_stats(season);

            if (season.league.id === 133) {
              // ID 133 means the league is NHL. We than addition all of the stats.
              totGames += season.stat.games;
              totGoals += season.stat.goals;
              totAssists += season.stat.assists;
              totPoints += season.stat.points;
              totPlusMinus += Number.isNaN(Number(season.stat.plusMinus)) ? 0 : season.stat.plusMinus;
              totPenaltyMinutes += parseInt(season.stat.penaltyMinutes, 10);
              if (playoffStats) {
                playoffTotGames += playoffStats.stat.games;
                playoffTotGoals += playoffStats.stat.goals;
                playoffTotAssists += playoffStats.stat.assists;
                playoffTotPoints += playoffStats.stat.points;
                playoffTotPlusMinus += Number.isNaN(Number(playoffStats.stat.plusMinus))
                  ? 0
                  : playoffStats.stat.plusMinus;
                playoffTotPenaltyMinutes += parseInt(playoffStats.stat.penaltyMinutes, 10);
              }
              // totShots += Number.isNaN(season.stat.shots)? 0 : season.stat.shots
              // totHits += Number.isNaN(season.stat.hits)? 0 : season.stat.hits
              // totBlocks += Number.isNaN(season.stat.blocked)? 0 : season.stat.blocked
              // totPPG += Number.isNaN(season.stat.powerPlayGoals)? 0 : season.stat.powerPlayGoals
            }

            return (
              <tr key={season} style={{ backgroundColor: get_league_row_color(season.league.name) }}>
                <td>{season.team.name}</td>
                {season.league.id === 133 ? ( // nhl league
                  <>
                    <td>
                      <Link
                        to={`/team-roster/${season.team.id}/${season.season}`}
                        style={{ textDecoration: 'none', color: '#0000ff' }}
                      >
                        {`${season.season.slice(0, 4)}-${season.season.slice(4)}`}
                      </Link>
                    </td>
                    <td>NHL</td>
                  </>
                ) : (
                  <>
                    <td>{`${season.season.slice(0, 4)}-${season.season.slice(4)}`}</td>
                    <td>{season.league.name}</td>
                  </>
                )}
                <td>
                  <b>{season.stat.games}</b>
                </td>
                <td>{season.stat.goals}</td>
                <td>{season.stat.assists}</td>
                <td>
                  <b>{season.stat.points}</b>
                </td>
                <td>{season.stat.plusMinus}</td>
                <td>{season.stat.penaltyMinutes}</td>
                <td>
                  <b>{playoffStats ? playoffStats.stat.games : '-'}</b>
                </td>
                <td>{playoffStats ? playoffStats.stat.goals : '-'}</td>
                <td>{playoffStats ? playoffStats.stat.assists : '-'}</td>
                <td>
                  <b>{playoffStats ? playoffStats.stat.points : '-'}</b>
                </td>
                <td>{playoffStats ? playoffStats.stat.plusMinus : '-'}</td>
                <td>{playoffStats ? playoffStats.stat.penaltyMinutes : '-'}</td>
                {/* <td>{season.stat.shots}</td>
                    <td>{season.stat.shotPct}</td>
                    <td>{season.stat.hits}</td>
                    <td>{season.stat.blocked}</td>
                    <td>{season.stat.powerPlayGoals}</td>
                    <td>{season.stat.faceOffPct}</td>
                    <td>{season.stat.timeOnIce}</td>
                    <td>{season.stat.powerPlayTimeOnIce}</td>
                    <td>{season.stat.shortHandedTimeOnIce}</td> */}
              </tr>
            );
          })}
          <tr>
            <th>Total nhl</th>
            <th>-</th>
            <th>-</th>
            <th>{totGames}</th>
            <th>{totGoals}</th>
            <th>{totAssists}</th>
            <th>{totPoints}</th>
            <th>{totPlusMinus}</th>
            <th>{totPenaltyMinutes}</th>
            {/* <th>{totShots}</th>
                <th>-</th>
                <th>{totHits}</th>
                <th>{totBlocks}</th>
                <th>{totPPG}</th>
                <th>-</th>
                <th>-</th>
                <th>-</th>
                <th>-</th> */}
            <th>{playoffTotGames}</th>
            <th>{playoffTotGoals}</th>
            <th>{playoffTotAssists}</th>
            <th>{playoffTotPoints}</th>
            <th>{playoffTotPlusMinus}</th>
            <th>{playoffTotPenaltyMinutes}</th>
          </tr>
        </tbody>
      </table>
    );
  };

  const render_goalie_stats = stats => {
    let totGames = 0;
    let totGameStarted = 0;
    let totGoalAgainst = 0;
    let totWins = 0;
    let totLosses = 0;
    let totOT = 0;
    let totSaves = 0;
    let totShotAgainst = 0;
    let totShutout = 0;
    return (
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan="14">Career Stats</th>
          </tr>
          <tr>
            <th>Team</th>
            <th>Season</th>
            <th>League</th>
            <th>Games</th>
            <th>GS</th>
            <th>GAA</th>
            <th>GA</th>
            <th>W</th>
            <th>L</th>
            <th>OT</th>
            <th>save %</th>
            <th>S</th>
            <th>SA</th>
            <th>SO</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(season => {
            if (season.league.id === 133) {
              // ID 133 means the league is NHL. We than addition all of the stats.
              totGames += season.stat.games;
              totGameStarted += season.stat.gamesStarted;
              totGoalAgainst += season.stat.goalsAgainst;
              totWins += season.stat.wins;
              totLosses += season.stat.losses;
              totOT += Number.isNaN(Number(season.stat.ot)) ? 0 : season.stat.ot;
              totSaves += Number.isNaN(Number(season.stat.saves)) ? 0 : season.stat.saves;
              totShotAgainst += Number.isNaN(Number(season.stat.shotsAgainst)) ? 0 : season.stat.shotsAgainst;
              totShutout += season.stat.shutouts;
            }
            return (
              <tr
                key={season}
                style={{
                  backgroundColor: get_league_row_color(season.league.name),
                }}
              >
                <td>{season.team.name}</td>
                {season.league.id === 133 ? ( // nhl league
                  <>
                    <td>
                      <Link
                        to={`/team-roster/${season.team.id}/${season.season}`}
                        style={{ textDecoration: 'none', color: '#000099' }}
                      >
                        {`${season.season.slice(0, 4)}-${season.season.slice(4)}`}
                      </Link>
                    </td>
                    <td>NHL</td>
                  </>
                ) : (
                  <>
                    <td>{`${season.season.slice(0, 4)}-${season.season.slice(4)}`}</td>
                    <td>{season.league.name}</td>
                  </>
                )}

                <td>{season.stat.games}</td>
                <td>{season.stat.gamesStarted}</td>
                <td>
                  {season.stat.goalAgainstAverage
                    ? Math.round((season.stat.goalAgainstAverage + Number.EPSILON) * 100) / 100
                    : null}
                </td>
                <td>{season.stat.goalsAgainst}</td>
                <td>{season.stat.wins}</td>
                <td>{season.stat.losses}</td>
                <td>{season.stat.ot}</td>
                <td>
                  {season.stat.savePercentage
                    ? Math.round((season.stat.savePercentage + Number.EPSILON) * 1000) / 1000
                    : null}
                </td>
                <td>{season.stat.saves}</td>
                <td>{season.stat.shotsAgainst}</td>
                <td>{season.stat.shutouts}</td>
              </tr>
            );
          })}
          <tr>
            <th>total nhl</th>
            <th>-</th>
            <th>-</th>
            <th>{totGames}</th>
            <th>{totGameStarted}</th>
            <th>-</th>
            <th>{totGoalAgainst}</th>
            <th>{totWins}</th>
            <th>{totLosses}</th>
            <th>{totOT}</th>
            <th>-</th>
            <th>{totSaves}</th>
            <th>{totShotAgainst}</th>
            <th>{totShutout}</th>
          </tr>
        </tbody>
      </table>
    );
  };

  const render_player_info = p => (
    <table className="content-table">
      <thead>
        <tr>
          <th>
            <img src={logos[p.currentTeam.name]} alt="" width="60" height="60" />
          </th>
          <th>
            <h3>{p.fullName}</h3>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>Position</th>
          <td>{p.primaryPosition.abbreviation}</td>
        </tr>
        <tr>
          <th>Shoot Catches</th>
          <td>{p.shootsCatches}</td>
        </tr>
        <tr>
          <th>Birth date</th>
          <td>{p.birthDate}</td>
        </tr>
        <tr>
          <th>Age</th>
          <td>{p.currentAge}</td>
        </tr>
        <tr>
          <th>Birth city</th>
          <td>{p.birthCity}</td>
        </tr>
        <tr>
          <th>Birth country</th>
          <td>{p.birthCountry}</td>
        </tr>
        <tr>
          <th>Height</th>
          <td>{p.height}</td>
        </tr>
        <tr>
          <th>Weight</th>
          <td>{p.weight}</td>
        </tr>
      </tbody>
    </table>
  );

  const render_player_info_stats = (stats, info) => (
    <div div className="cont">
      {render_player_info(info)}
      {info.primaryPosition.abbreviation !== 'G' ? render_skater_stats(stats) : render_goalie_stats(stats)}
    </div>
  );

  if (playerStats && playerPlayoffStats && playerInfo) {
    return render_player_info_stats(playerStats.stats[0].splits, playerInfo.people[0]);
  }

  if (!Number.isNaN(Number(playerID)) && playerID !== '' && !prospectInfo) {
    return (
      <div className="cont">
        <h1>Trying to fetch player data from nhl api...</h1>
        <ClipLoader color="#fff" loading size={75} />
      </div>
    );
  }

  if (prospectInfo) {
    return <div className="cont">{render_player_info(prospectInfo)}</div>;
  }

  return (
    <div className="cont">
      <h1>Player does not exist</h1>
    </div>
  );
}
