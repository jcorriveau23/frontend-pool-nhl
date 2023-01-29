import React from 'react';

export default function SeasonOption({ season, setSeason, seasonParams, setSeasonParams, firstSeason, lastSeason }) {
  const filter = s => {
    if (!firstSeason && !lastSeason) return true;
    if (Number(s) >= firstSeason && (!lastSeason || Number(s) <= lastSeason)) return true;

    return false;
  };

  const season_options = () => {
    const seasonArray = [];

    for (let i = 2022; i > 1916; i -= 1) seasonArray.push(i.toString() + (i + 1).toString());

    return seasonArray
      .filter(s => filter(s))
      .map(s => (
        <option key={s} value={s} selected={s === season ? 'selected' : null}>
          {`${s.substr(0, 4)}-${s.substr(-2)}`}
        </option>
      ));
  };

  const handleChangeSeason = event => {
    const updatedSearchParams = new URLSearchParams(seasonParams.toString());
    updatedSearchParams.set('season', event.target.value);
    setSeasonParams(updatedSearchParams.toString());

    setSeason(event.target.value);
  };

  return <select onChange={handleChangeSeason}>{season_options()}</select>;
}
