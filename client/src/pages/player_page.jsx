import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

export default function PlayerPage() {
  const [playerInfo, setPlayerInfo] = useState(null);
  const [isError, setIsError] = useState(false);
  const location = useLocation();

  const playerID = window.location.pathname.split('/').pop();

  const get_player_stats = async () => {
    try {
      const res = await axios.get(`/cors-anywhere/https://api-web.nhle.com/v1/player/${playerID}/landing`);

      setPlayerInfo(res.data);
    } catch (e) {
      setIsError(true);
    }
  };

  useEffect(() => {
    const ID = parseInt(playerID, 10);

    get_player_stats();
  }, [location]);

  const get_league_row_color = leagueName => {
    switch (leagueName) {
      case 'NHL':
        return '#ffd68c';
      case 'AHL':
        return '#f5abab';
      default:
        return null;
    }
  };

  const get_playoff_stats = season => {
    for (let i = 0; i < playerInfo.seasonTotals.length; i += 1) {
      if (
        playerInfo.seasonTotals.gameTypeId === 3 &&
        playerInfo.seasonTotals.season === season.season &&
        playerInfo.seasonTotals.leagueAbbrev === season.leagueAbbrev &&
        playerInfo.seasonTotals.teamName.default === season.teamName.default
      ) {
        return playerInfo.seasonTotals[i];
      }
    }
    return null;
  };

  const render_skater_stats = () => (
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
        {playerInfo.seasonTotals
          .filter(season => season.gameTypeId === 2)
          .map(season => {
            // Get the corresponding sesason playoff stats.
            const playoffSeason = get_playoff_stats(season.leagueAbbrev);

            return (
              <tr style={{ backgroundColor: get_league_row_color(season.leagueAbbrev) }}>
                <td>{season.teamName.default}</td>
                {/* {season.leagueAbbrev === "NHL" ? ( // nhl league
                  <>
                    <td>
                      <Link
                        to={`/team-roster?teamId=${season.team.id}&season=${season.season}`}
                        style={{ textDecoration: 'none', color: '#0000ff' }}
                      >
                        {`${season.season.slice(0, 4)}-${season.season.slice(4)}`}
                      </Link>
                    </td>
                    <td>NHL</td>
                  </>
                ) : (
                    <td>{`${season.season.slice(0, 4)}-${season.season.slice(4)}`}</td>
                )} */}
                <td>{season.season}</td>
                <td>{season.leagueAbbrev}</td>
                <td>
                  <b>{season.gamesPlayed}</b>
                </td>
                <td>{season.goals}</td>
                <td>{season.assists}</td>
                <td>
                  <b>{season.points}</b>
                </td>
                <td>{season.plusMinus}</td>
                <td>{season.pim}</td>
                <td>
                  <b>{playoffSeason ? playoffSeason.gamesPlayed : '-'}</b>
                </td>
                <td>{playoffSeason ? playoffSeason.goals : '-'}</td>
                <td>{playoffSeason ? playoffSeason.assists : '-'}</td>
                <td>
                  <b>{playoffSeason ? playoffSeason.points : '-'}</b>
                </td>
                <td>{playoffSeason ? playoffSeason.plusMinus : '-'}</td>
                <td>{playoffSeason ? playoffSeason.pim : '-'}</td>
              </tr>
            );
          })}
        <tr>
          <th>Total nhl</th>
          <th>-</th>
          <th>-</th>
          <th>{playerInfo.careerTotals?.regularSeason?.gamesPlayed}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.goals}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.assists}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.points}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.plusMinus}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.pim}</th>
          <th>{playerInfo.careerTotals?.playoffs?.games}</th>
          <th>{playerInfo.careerTotals?.playoffs?.goals}</th>
          <th>{playerInfo.careerTotals?.playoffs?.assists}</th>
          <th>{playerInfo.careerTotals?.playoffs?.points}</th>
          <th>{playerInfo.careerTotals?.playoffs?.plusMinus}</th>
          <th>{playerInfo.careerTotals?.playoffs?.pim}</th>
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
          <th>SA</th>
          <th>SO</th>
        </tr>
      </thead>
      <tbody>
        {playerInfo.seasonTotals
          .filter(season => season.gameTypeId === 2)
          .map(season => (
            <tr
              style={{
                backgroundColor: get_league_row_color(season.leagueAbbrev),
              }}
            >
              <td>{season.teamName.default}</td>
              {/* {season.league.id === 133 ? ( // nhl league
                <>
                  <td>
                    <Link
                      to={`/team-roster?teamId=${season.team.id}&season=${season.season}`}
                      style={{ textDecoration: 'none', color: '#000099' }}
                    >
                    </Link>
                  </td>
                  <td>NHL</td>
                </>
              ) : (
                <>
                  <td>{season.league.name}</td>
                </>
              )} */}
              <td>{season.season}</td>
              <td>{season.leagueAbbrev}</td>
              <td>{season.gamesPlayed}</td>
              <td>{season.gamesStarted}</td>
              <td>{season.goalAgainstAvg}</td>
              <td>{season.goalsAgainst}</td>
              <td>{season.wins}</td>
              <td>{season.losses}</td>
              <td>{season.otLosses}</td>
              <td>{season.savePctg ? Math.round((season.savePctg + Number.EPSILON) * 1000) / 1000 : null}</td>
              <td>{season.shotsAgainst}</td>
              <td>{season.shutouts}</td>
            </tr>
          ))}
        <tr>
          <th>total nhl</th>
          <th>-</th>
          <th>-</th>
          <th>{playerInfo.careerTotals?.regularSeason?.gamesPlayed}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.gameStarted}</th>
          <th>-</th>
          <th>{playerInfo.careerTotals?.regularSeason?.goalsAgainst}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.wins}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.losses}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.otLosses}</th>
          <th>-</th>
          <th>{playerInfo.careerTotals?.regularSeason?.shotsAgainst}</th>
          <th>{playerInfo.careerTotals?.regularSeason?.shutouts}</th>
        </tr>
      </tbody>
    </table>
  );

  const render_player_info = () => (
    <>
      <img src={`https://cms.nhl.bamgrid.com/images/headshots/current/168x168/${playerID}.jpg`} alt="" />
      <table className="content-table">
        <thead>
          <tr>
            <th>{playerInfo.teamLogo ? <img src={playerInfo.teamLogo} alt="" width="60" height="60" /> : null}</th>
            <th>
              <h3>
                {playerInfo.firstName.default} {playerInfo.lastName.default}
              </h3>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Position</th>
            <td>{playerInfo.position}</td>
          </tr>
          <tr>
            <th>Shoot Catches</th>
            <td>{playerInfo.shootsCatches}</td>
          </tr>
          <tr>
            <th>Birth date</th>
            <td>{playerInfo.birthDate}</td>
          </tr>
          <tr>
            <th>Age</th>
            <td>{playerInfo.currentAge}</td>
          </tr>
          <tr>
            <th>Birth city</th>
            <td>{playerInfo.birthCity.default}</td>
          </tr>
          <tr>
            <th>Birth country</th>
            <td>{playerInfo.birthCountry}</td>
          </tr>
          <tr>
            <th>Height (inches)</th>
            <td>{playerInfo.heightInInches}</td>
          </tr>
          <tr>
            <th>Weight (pounds)</th>
            <td>{playerInfo.weightInPounds}</td>
          </tr>
          <tr>
            <th>Drafted</th>
            <td>
              {playerInfo.draftDetails
                ? `${playerInfo.draftDetails.overallPick} overall in ${playerInfo.draftDetails.year}`
                : null}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );

  if (playerInfo) {
    return (
      <div className="cont">
        {render_player_info()}
        {playerInfo.position !== 'G' ? render_skater_stats() : render_goalie_stats()}
      </div>
    );
  }

  if (isError)
    return (
      <div className="cont">
        <h1>Player information was not found.</h1>
      </div>
    );

  return (
    <div className="cont">
      <ClipLoader color="#fff" loading size={75} />
    </div>
  );
}
