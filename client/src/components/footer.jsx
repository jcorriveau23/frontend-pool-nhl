import React from 'react';

// icons
import { IoLogoTwitter, IoLogoGithub } from 'react-icons/io';

export default function Footer() {
  const open_link = async link => {
    window.open(link);
  };

  return (
    <div className="cont">
      <IoLogoTwitter
        size={70}
        color="black"
        className="icon-link"
        onClick={() => open_link('https://twitter.com/hockeypool3')}
      />
      <IoLogoGithub
        size={70}
        color="black"
        className="icon-link"
        onClick={() => open_link('https://github.com/jcorriveau23/pool-nhl-ethereum')}
      />
    </div>
  );
}
