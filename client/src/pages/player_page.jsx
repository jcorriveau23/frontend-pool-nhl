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
  const [totalCareer, setTotalCareer] = useState(null);
  const [totalCareerPlayoffs, setTotalCareerPlayoffs] = useState(null);
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
        axios
          .get(
            `https://statsapi.web.nhl.com/api/v1/people/${playerID}?expand=person.stats&stats=yearByYear,yearByYearPlayoffs,careerRegularSeason,careerPlayoffs&expand=stats.team&site=en_nhlCA`
          ) // https://statsapi.web.nhl.com/api/v1/people/8475726?expand=person.stats&stats=yearByYear,yearByYearPlayoffs,careerRegularSeason&expand=stats.team&site=en_nhlCA
          .then(res => {
            console.log(res);
            setPlayerInfo(res.data);
            setPlayerStats(res.data.people[0].stats[0]);
            setPlayerPlayoffStats(res.data.people[0].stats[1]);
            if (res.data.people[0].stats[2].splits.length > 0)
              setTotalCareer(res.data.people[0].stats[2].splits[0].stat);
            if (res.data.people[0].stats[3].splits.length > 0)
              setTotalCareerPlayoffs(res.data.people[0].stats[3].splits[0].stat);
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
      setPlayerPlayoffStats(null);
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
    for (let i = 0; i < playerPlayoffStats.splits.length; i += 1) {
      if (
        playerPlayoffStats.splits[i].season === season.season &&
        playerPlayoffStats.splits[i].league.name === season.league.name &&
        playerPlayoffStats.splits[i].team.name === season.team.name
      ) {
        return playerPlayoffStats.splits[i];
      }
    }
    return null;
  };

  const render_skater_stats = stats => (
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
            </tr>
          );
        })}
        <tr>
          <th>Total nhl</th>
          <th>-</th>
          <th>-</th>
          <th>{totalCareer?.games}</th>
          <th>{totalCareer?.goals}</th>
          <th>{totalCareer?.assists}</th>
          <th>{totalCareer?.points}</th>
          <th>{totalCareer?.plusMinus}</th>
          <th>{totalCareer?.penaltyMinutes}</th>
          <th>{totalCareerPlayoffs?.games}</th>
          <th>{totalCareerPlayoffs?.goals}</th>
          <th>{totalCareerPlayoffs?.assists}</th>
          <th>{totalCareerPlayoffs?.points}</th>
          <th>{totalCareerPlayoffs?.plusMinus}</th>
          <th>{totalCareerPlayoffs?.penaltyMinutes}</th>
        </tr>
      </tbody>
    </table>
  );

  const render_goalie_stats = stats => (
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
        {stats.map(season => (
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
        ))}
        <tr>
          <th>total nhl</th>
          <th>-</th>
          <th>-</th>
          <th>{totalCareer?.games}</th>
          <th>{totalCareer?.gameStarted}</th>
          <th>-</th>
          <th>{totalCareer?.goalsAgainst}</th>
          <th>{totalCareer?.wins}</th>
          <th>{totalCareer?.losses}</th>
          <th>{totalCareer?.ot}</th>
          <th>-</th>
          <th>{totalCareer?.saves}</th>
          <th>{totalCareer?.shotAgainst}</th>
          <th>{totalCareer?.shutouts}</th>
        </tr>
      </tbody>
    </table>
  );

  const render_player_info = p => (
    <>
      <img src={`https://cms.nhl.bamgrid.com/images/headshots/current/168x168/${playerID}.jpg`} alt="" />
      <table className="content-table">
        <thead>
          <tr>
            <th>{p.currentTeam ? <img src={logos[p.currentTeam.id]} alt="" width="60" height="60" /> : null}</th>
            <th>
              <h3>
                {p.fullName}
                {p.captain ? ` (C)` : p.alternateCaptain ? ` (A)` : null}
              </h3>
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
    </>
  );

  const render_player_info_stats = (stats, info) => (
    <div div className="cont">
      {render_player_info(info)}
      {info.primaryPosition.abbreviation !== 'G' ? render_skater_stats(stats) : render_goalie_stats(stats)}
    </div>
  );

  if (playerStats && playerPlayoffStats && playerInfo) {
    return render_player_info_stats(playerStats.splits, playerInfo.people[0]);
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
