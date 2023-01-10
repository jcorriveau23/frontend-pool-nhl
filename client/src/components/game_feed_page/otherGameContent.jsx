import React, { useRef, useEffect, useState } from 'react';

// css
import './goalItem.css';

export default function OtherGameContent({ gameContent }) {
  const videoRef = useRef();
  const [isItem, setIsItem] = useState(false);

  // const previousUrl = useRef(recapVideo.playbacks[3].url) // TODO: validate if we can use a previous Ref to make  bether in the useEffect

  useEffect(() => {
    videoRef?.current?.load();
  }, [gameContent]);

  const setVideoFullScreen = () => {
    // This functions is called when clicking on a video, the video is going into full screen.
    // (Mostly usefull for mobile users)
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

  if (gameContent && gameContent.highlights.scoreboard && gameContent.highlights.scoreboard.items?.length > 0) {
    return (
      <div>
        <table className="goal-item">
          <thead>
            {isItem ? (
              <tr>
                <th>Other games content</th>
              </tr>
            ) : null}
          </thead>
          {gameContent.highlights.scoreboard.items
            .filter(highlight => !highlight.keywords.find(k => k.type === 'statsEventId') && highlight.playbacks) // other content video does not have statsEventId
            .map(highlight => {
              if (isItem === false) setIsItem(true);
              return (
                <tbody key={highlight.id}>
                  <tr>
                    <td>
                      <b>{highlight.title}</b>
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={3}>
                      <video onPlaying={setVideoFullScreen} width="100%" height="100%" controls ref={videoRef}>
                        <source src={highlight.playbacks[3].url} type="video/mp4" />
                        <track kind="captions" />
                      </video>
                    </td>
                  </tr>
                </tbody>
              );
            })}
        </table>
      </div>
    );
  }

  return null;
}
