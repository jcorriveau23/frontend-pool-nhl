import React from 'react';

export default function SeasonOption({ season, setSeason, seasonParams, setSeasonParams }) {
  const season_options = () => {
    const seasonArray = [];

    for (let i = 2022; i > 1916; i -= 1) seasonArray.push(i);

    return seasonArray.map(s => (
      <option
        key={s}
        value={s.toString() + (s + 1).toString()}
        selected={s.toString() + (s + 1).toString() === season ? 'selected' : null}
      >
        {`${s.toString()}-${(s + 1).toString()}`}
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
