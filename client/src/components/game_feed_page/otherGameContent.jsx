import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// css
import './goalItem.css';

export default function OtherGameContent({ gameContent }) {
  const videoRef = useRef();
  const [isItem, setIsItem] = useState(false);

  // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

  useEffect(() => {
    videoRef?.current?.load();
  }, [gameContent]);

  if (gameContent.media && gameContent.media.milestones.items?.length > 0) {
    return (
      <div>
        <table className="goalItem">
          <thead>
            {isItem ? (
              <tr>
                <th colSpan={3}>Other games content</th>
              </tr>
            ) : null}
          </thead>
          {gameContent.media.milestones.items
            .filter(highlight => highlight.type !== 'GOAL' && highlight.highlight && highlight.highlight.playbacks)
            .map(highlight => {
              if (isItem === false) setIsItem(true);
              // console.log(highlight)
              return (
                <tbody key={highlight.playerId}>
                  <tr>
                    <td colSpan={3}>
                      <Link
                        to={`/player-info/${highlight.playerId}`}
                        style={{ textDecoration: 'none', color: '#000099' }}
                      >
                        {highlight.highlight.description}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <th>Period:</th>
                    <td>{highlight.period}</td>
                    <td rowSpan={2}>
                      <video width="224" height="126" controls ref={videoRef}>
                        <source src={highlight.highlight.playbacks[3].url} type="video/mp4" />
                        <track kind="captions" />
                      </video>
                    </td>
                  </tr>
                  <tr>
                    <th>Period time:</th>
                    <td>{highlight.periodTime}</td>
                  </tr>
                </tbody>
              );
            })}
        </table>
      </div>
    );
  }

  return <h1> </h1>;
}

OtherGameContent.propTypes = {
  gameContent: PropTypes.shape({
    media: PropTypes.shape({
      milestones: PropTypes.shape({ items: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired }).isRequired,
    }).isRequired,
  }).isRequired,
};
