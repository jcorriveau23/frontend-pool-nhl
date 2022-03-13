import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function GameRecap({ gameContent, isEditorial }) {
  const videoRef = useRef();
  const [prevGameContent, setPrevGameContent] = useState(null);
  // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

  useEffect(() => {
    if (prevGameContent !== gameContent) {
      videoRef?.current?.load();
      setPrevGameContent(gameContent);
    }
  }, [gameContent]);

  if (isEditorial && gameContent.editorial && gameContent.media.epg[3].items?.length > 0) {
    console.log(gameContent);
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>{gameContent.title}</th>
            </tr>
            <tr>
              <th>{gameContent.description}</th>
            </tr>
            <tr>
              <td>
                <video
                  width="700"
                  height="394"
                  poster={gameContent.media.epg[3].items[0].image.cuts['640x360']?.src}
                  controls
                  ref={videoRef}
                >
                  <source src={gameContent.media.epg[3].items[0].playbacks[3].url} type="video/mp4" />
                  <track kind="captions" />
                </video>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (!isEditorial && gameContent.media && gameContent.media.epg[2].items?.length > 0) {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>{gameContent.title}</th>
            </tr>
            <tr>
              <th>{gameContent.description}</th>
            </tr>
            <tr>
              <video
                width="700"
                height="394"
                controls
                poster={gameContent.media.epg[2].items[0].image.cuts['640x360']?.src}
                ref={videoRef}
              >
                <source src={gameContent.media.epg[2].items[0].playbacks[3].url} type="video/mp4" />
                <track kind="captions" />
              </video>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return <h1>No Recap videos available yet</h1>;
}

GameRecap.propTypes = {
  gameContent: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    editorial: PropTypes.shape({}).isRequired,
    media: PropTypes.shape({
      epg: PropTypes.arrayOf(
        PropTypes.shape({
          items: PropTypes.arrayOf(
            PropTypes.shape({
              image: PropTypes.shape({
                cuts: PropTypes.arrayOf(PropTypes.shape({ src: PropTypes.string.isRequired })),
              }),
              playbacks: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string.isRequired }).isRequired),
            }).isRequired
          ).isRequired,
        }).isRequired
      ).isRequired,
    }).isRequired,
  }).isRequired,
  isEditorial: PropTypes.bool.isRequired,
};
