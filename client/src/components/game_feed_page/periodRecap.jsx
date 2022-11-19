import React, { useState } from 'react';
import PropTypes from 'prop-types';

// component
import GoalItem from './goalItem';

// css
import './goalItem.css';

export default function PeriodRecap({ gameInfo, gameContent, period }) {
  const [isItem, setIsItem] = useState(false);
  // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

  if (gameInfo.liveData && gameInfo.liveData.plays) {
    return (
      <div>
        <table className="goal-item">
          <thead>
            {isItem ? (
              <tr>
                <th>{period === '4' ? 'OT' : `Period: ${period}`}</th>
              </tr>
            ) : null}
          </thead>
          <tbody>
            {gameInfo.liveData.plays.scoringPlays
              .filter(playIndex => gameInfo.liveData.plays.allPlays[playIndex].about.period === parseInt(period, 10))
              .map(playIndex => {
                if (isItem === false) setIsItem(true);
                return (
                  <tr key={playIndex}>
                    <td>
                      <GoalItem goalData={gameInfo.liveData.plays.allPlays[playIndex]} gameContent={gameContent} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }

  return <h1> </h1>;
}

PeriodRecap.propTypes = {
  gameInfo: PropTypes.shape({
    liveData: PropTypes.shape({
      plays: PropTypes.shape({
        scoringPlays: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
        allPlays: PropTypes.arrayOf(
          PropTypes.shape({ about: PropTypes.shape({ period: PropTypes.number.isRequired }).isRequired }).isRequired
        ),
      }).isRequired,
    }).isRequired,
  }).isRequired,
  gameContent: PropTypes.shape({}).isRequired,
  period: PropTypes.string.isRequired,
};
