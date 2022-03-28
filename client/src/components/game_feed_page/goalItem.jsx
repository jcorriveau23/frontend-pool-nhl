import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// css
import './goalItem.css';

// images
import { logos } from '../img/logos';

export default function GoalItem({ goalData, gameContent }) {
  const videoRef = useRef();
  const [goalContent, setGoalContent] = useState(null);
  const [scorer, setScorer] = useState('');
  const [firstAssist, setFirstAssist] = useState(null);
  const [secondAssist, setSecondAssist] = useState(null);
  const [rowSpan, setRowSpan] = useState(2);

  // const previousUrl = useRef(goalContent.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

  useEffect(() => {
    // console.log(goalData)
    // console.log(gameContent)

    if (gameContent.media.milestones.items) {
      for (let i = 0; i < gameContent.media.milestones.items.length; i += 1) {
        if (parseInt(gameContent.media.milestones.items[i].statsEventId, 10) === goalData.about.eventId)
          if (
            gameContent.media.milestones.items[i].highlight &&
            gameContent.media.milestones.items[i].highlight.playbacks?.length > 3
          ) {
            // console.log('found the video');
            setGoalContent({
              ...gameContent.media.milestones.items[i].highlight,
            });
          }
      }
    }

    let bFirstAssist = false;

    for (let i = 0; i < goalData.players.length; i += 1) {
      if (goalData.players[i].playerType === 'Scorer') {
        setScorer(goalData.players[i]);
      }

      if (goalData.players[i].playerType === 'Assist') {
        if (bFirstAssist === false) {
          bFirstAssist = true;
          setFirstAssist(goalData.players[i]);
          setRowSpan(3);
        } else {
          setSecondAssist(goalData.players[i]);
          setRowSpan(4);
        }
      }
    }
  }, [goalData, gameContent]);

  useEffect(() => {
    videoRef?.current?.load();
  }, [goalContent]);

  return (
    <div>
      <table className="goalItem">
        <tbody>
          <tr>
            <td rowSpan={rowSpan} width="30">
              <img src={logos[goalData.team.name]} alt="" width="30" height="30" />
            </td>
            <th width="125">Time:</th>
            <td width="250">{goalData.about.periodTime}</td>
            <td rowSpan={rowSpan} width="225">
              {goalContent ? (
                <video width="224" height="126" poster={goalContent.image.cuts['248x140']?.src} controls ref={videoRef}>
                  <source src={goalContent.playbacks[3].url} type="video/mp4" />
                  <track kind="captions" />
                </video>
              ) : (
                <p>No video yet</p>
              )}
            </td>
          </tr>
          {scorer ? (
            <tr>
              <th>Scorer:</th>
              <td>
                <Link to={`/player-info/${scorer.player.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                  {`${scorer.player.fullName} (${scorer.seasonTotal})`}
                </Link>
              </td>
            </tr>
          ) : null}
          {firstAssist ? (
            <tr>
              <th>1st Assists:</th>
              <td>
                <Link to={`/player-info/${firstAssist.player.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                  {`${firstAssist.player.fullName} (${firstAssist.seasonTotal})`}
                </Link>
              </td>
            </tr>
          ) : null}
          {secondAssist ? (
            <tr>
              <th>2nd Assists:</th>
              <td>
                <Link
                  to={`/player-info/${secondAssist.player.id}`}
                  style={{ textDecoration: 'none', color: '#000099' }}
                >
                  {`${secondAssist.player.fullName} (${secondAssist.seasonTotal})`}
                </Link>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

GoalItem.propTypes = {
  goalData: PropTypes.shape({
    team: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
    about: PropTypes.shape({ periodTime: PropTypes.string.isRequired, eventId: PropTypes.number.isRequired })
      .isRequired,
    players: PropTypes.arrayOf(PropTypes.shape({ playerType: PropTypes.string.isRequired }).isRequired).isRequired,
  }).isRequired,
  gameContent: PropTypes.shape({
    media: PropTypes.shape({
      milestones: PropTypes.shape({
        items: PropTypes.arrayOf(
          PropTypes.shape({
            statsEventId: PropTypes.string.isRequired,
            highlight: PropTypes.shape({
              playbacks: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
            }),
          }).isRequired
        ).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
