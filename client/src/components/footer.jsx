import React from 'react';

// icons
import { IoLogoTwitter, IoLogoGithub } from 'react-icons/io';

export default function Footer() {
  const open_link = async link => {
    window.open(link);
  };

  return (
    <div className="cont">
      <button className="icon-button" onClick={() => open_link('https://twitter.com/hockeypool3')} type="button">
        <IoLogoTwitter size={70} />
      </button>
      <button
        className="icon-button"
        onClick={() => open_link('https://github.com/jcorriveau23/backend-pool-nhl')}
        type="button"
      >
        <IoLogoGithub size={70} />
      </button>
    </div>
  );
}
