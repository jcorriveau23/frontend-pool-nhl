import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import PlayerLink from '../playerLink';

export default function BoxScore({ gameId }) {
  const [boxscore, setBoxscore] = useState(null);

  const get_game_box_score = async () => {
    try {
      const res = await axios.get(`/api-rust/game/boxscore/${gameId}`);
      setBoxscore(res.data);
    } catch (e) {
      alert(e.response.data);
    }
  };

  useEffect(() => {
    get_game_box_score();
  }, [gameId]);

  const sort_by_int = (players, stat) => {
    // setTeamSkaters([...array]);
  };

  const sort_by_float = (players, stat) => {
    // setTeamSkaters([...array]);
  };

  const render_team_skaters = (title, team, skaters) => (
    <div>
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan={17}>
              <img src={team.logo} alt="" width="70" height="70" />
            </th>
          </tr>
          <tr>
            <th colSpan={17}>{title}</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>R</th>
            <th onClick={() => sort_by_int(skaters, 'goals')}>G</th>
            <th onClick={() => sort_by_int(skaters, 'assists')}>A</th>
            <th onClick={() => sort_by_int(skaters, 'points')}>P</th>
            <th onClick={() => sort_by_int(skaters, 'plusMinus')}>+/-</th>
            <th onClick={() => sort_by_int(skaters, 'pim')}>PIM</th>
            <th onClick={() => sort_by_int(skaters, 'shots')}>SOG</th>
            <th onClick={() => sort_by_int(skaters, 'hits')}>HITS</th>
            <th onClick={() => sort_by_int(skaters, 'blockedShots')}>BLKS</th>
            <th onClick={() => sort_by_float(skaters, 'faceoffs')}>FO%</th>
            <th onClick={() => sort_by_float(skaters, 'toi')}>TOI</th>
            <th onClick={() => sort_by_float(skaters, 'powerPlayToi')}>PP TOI</th>
            <th onClick={() => sort_by_float(skaters, 'shorthandedToi')}>SH TOI</th>
          </tr>
        </thead>
        <tbody>
          {skaters.map(skater => (
            <tr>
              <td>{skater.sweaterNumber}</td>
              <td>
                <PlayerLink name={skater.name.default} id={skater.playerId} />
              </td>
              <td>{skater.position}</td>
              <td>{skater.goals}</td>
              <td>{skater.assists}</td>
              <td>{skater.points}</td>
              <td>{skater.plusMinus}</td>
              <td>{skater.pim}</td>
              <td>{skater.shots}</td>
              <td>{skater.hits}</td>
              <td>{skater.blockedShots}</td>
              <td>{skater.faceoffs}</td>
              <td>{skater.toi}</td>
              <td>{skater.powerPlayToi}</td>
              <td>{skater.shorthandedToi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const render_team_goalies = (team, goalies) => (
    <div>
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan={7}>
              <img src={team.logo} alt="" width="70" height="70" />
            </th>
          </tr>
          <tr>
            <th colSpan={7}>Goalies</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th onClick={() => sort_by_int(goalies, 'toi')}>TOI</th>
            <th onClick={() => sort_by_int(goalies, 'goals')}>G</th>
            <th onClick={() => sort_by_int(goalies, 'assists')}>A</th>
            <th onClick={() => sort_by_int(goalies, 'saveShotsAgainst')}>Saves</th>
            <th onClick={() => sort_by_int(goalies, 'savePctg')}>%</th>
          </tr>
        </thead>
        <tbody>
          {goalies.map(goalie => (
            <tr>
              <td>{goalie.sweaterNumber}</td>
              <PlayerLink name={goalie.name.default} id={goalie.playerId} width="35" height="35" />
              <td>{goalie.toi}</td>
              <td>{goalie.goals}</td>
              <td>{goalie.assists}</td>
              <td>{goalie.saveShotsAgainst}</td>
              <td>{goalie.savePctg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (boxscore) {
    return (
      <div>
        <h1>Box score</h1>

        {render_team_skaters('Forwards', boxscore.awayTeam, boxscore.boxscore.playerByGameStats.awayTeam.forwards)}
        {render_team_skaters('Defense', boxscore.awayTeam, boxscore.boxscore.playerByGameStats.awayTeam.defense)}
        {render_team_goalies(boxscore.awayTeam, boxscore.boxscore.playerByGameStats.awayTeam.goalies)}

        {render_team_skaters('Forwards', boxscore.homeTeam, boxscore.boxscore.playerByGameStats.homeTeam.forwards)}
        {render_team_skaters('Defense', boxscore.homeTeam, boxscore.boxscore.playerByGameStats.homeTeam.defense)}
        {render_team_goalies(boxscore.homeTeam, boxscore.boxscore.playerByGameStats.homeTeam.goalies)}
      </div>
    );
  }
  return <h1>Loading</h1>;
}
