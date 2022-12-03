import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// css
import './goalItem.css';

// components
import PlayerLink from '../playerLink';

// images
import { logos } from '../img/logos';

export default function GoalItem({ goalData, gameContent }) {
  const videoRef = useRef();
  const [goalContent, setGoalContent] = useState(null);
  const [scorer, setScorer] = useState([]);
  const [assists, setAssists] = useState([]);

  const [rowSpan, setRowSpan] = useState(2);

  // const previousUrl = useRef(goalContent.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

  useEffect(() => {
    // Try to find the video related to the goal.

    if (gameContent) {
      const goalVid = gameContent.highlights.scoreboard.items.find(item => {
        for (let i = 0; i < item.keywords.length; i += 1) {
          if (item.keywords[i].type === 'statsEventId') {
            return Number(item.keywords[i].value) === goalData.about.eventId;
          }
        }
        return false;
      });

      if (goalVid && goalVid.playbacks?.length > 3) {
        // console.log('found the video');
        setGoalContent(goalVid);
      }
    }

    // Set goal and assist players related to the goal

    setScorer(goalData.players.filter(p => p.playerType === 'Scorer'));
    const a = goalData.players.filter(p => p.playerType === 'Assist');
    setAssists(a);

    setRowSpan(a.length + 2);
  }, [goalData, gameContent]);

  useEffect(() => {
    videoRef?.current?.load();
  }, [goalContent]);

  const setVideoFullScreen = () => {
    const el = videoRef.current;

    // el.paused will detect if paused
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };

  return (
    <div>
      <table className="goal-item">
        <tbody>
          <tr>
            <td rowSpan={rowSpan} width="30">
              <img src={logos[goalData.team.id]} alt="" width="40" height="40" />
            </td>
            <th width="125">Time:</th>
            <td width="250">{goalData.about.periodTime}</td>
            <td rowSpan={rowSpan} width="225">
              {goalContent ? (
                <video
                  onPlaying={setVideoFullScreen}
                  width="100%"
                  height="100%"
                  poster={goalContent.image.cuts['248x140']?.src}
                  ref={videoRef}
                  controls
                >
                  <source src={goalContent.playbacks[3].url} type="video/mp4" />
                  <track kind="captions" />
                </video>
              ) : (
                <p>No video yet</p>
              )}
            </td>
          </tr>
          {scorer.length > 0 ? (
            <tr>
              <th>Scorer:</th>
              <td>
                <PlayerLink name={scorer[0].player.fullName} id={scorer[0].player.id} number={scorer[0].seasonTotal} />
              </td>
            </tr>
          ) : null}
          {assists.length > 0 ? (
            <tr>
              <th>1st Assists:</th>
              <td>
                <PlayerLink
                  name={assists[0].player.fullName}
                  id={assists[0].player.id}
                  number={assists[0].seasonTotal}
                />
              </td>
            </tr>
          ) : null}
          {assists.length > 1 ? (
            <tr>
              <th>2nd Assists:</th>
              <td>
                <PlayerLink
                  name={assists[1].player.fullName}
                  id={assists[1].player.id}
                  number={assists[1].seasonTotal}
                />
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
