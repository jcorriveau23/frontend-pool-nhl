import React, { useState } from 'react';

// css
import './goalItem.css';

// components
import PlayerLink from '../playerLink';

// images
import { team_info, abbrevToTeamId } from '../img/logos';

export default function GoalItem({ goalData }) {
  const [rowSpan] = useState(goalData.assists.length + 2);

  return (
    <div>
      <table className="goal-item">
        <tbody>
          <tr>
            <td rowSpan={rowSpan} width="30">
              <img src={team_info[abbrevToTeamId[goalData.teamAbbrev.default]]?.logo} alt="" width="70" height="70" />
            </td>
            <th width="125">Time:</th>
            <td width="250">{goalData.timeInPeriod}</td>
            <td rowSpan={rowSpan} width="225">
              <img src={goalData.headshot} alt="" width="140" height="140" />
            </td>
          </tr>
          <tr>
            <th>Scorer:</th>
            <td>
              <PlayerLink
                name={`${goalData.firstName.default} ${goalData.lastName.default}`}
                id={goalData.playerId}
                number={goalData.goalsToDate}
              />
            </td>
          </tr>
          {goalData.assists.map((assist, i) => (
            <tr>
              <th>Assist #{i + 1}</th>
              <td>
                <PlayerLink
                  name={`${assist.firstName.default} ${assist.lastName.default}`}
                  id={assist.playerId}
                  number={assist.assistsToDate}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
