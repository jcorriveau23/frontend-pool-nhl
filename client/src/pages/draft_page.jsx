import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// components
import PlayerLink from '../components/playerLink';

// images
import { team_info } from '../components/img/logos';

export default function DraftPage(injury) {
  const [draftInfo, setDraftInfo] = useState(null);
  const [prevYear, setPrevYear] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const year = window.location.pathname.split('/').pop();

  const get_draft = async () => {
    try {
      const res = await axios.get(`https://statsapi.web.nhl.com/api/v1/draft/${year}`); // https://statsapi.web.nhl.com/api/v1/draft/2021
      setDraftInfo(res.data);
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (prevYear !== year && !Number.isNaN(Number(year))) {
      get_draft();
      setPrevYear(year);
    } else {
      navigate('/draft/2023');
    }
  }, [location]);

  const render_round = roundInfo => (
    <div key={roundInfo.round}>
      <table className="content-table">
        <thead>
          <tr>
            <th colSpan="3">Round # {roundInfo.round}</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {roundInfo.picks.map(pick => (
            <tr key={pick.pickOverall}>
              <td>{pick.pickOverall}</td>
              <td>
                <img src={team_info[pick.team.id]?.logo} alt="" width="40" height="40" />
              </td>
              {pick.prospect.id > 0 ? (
                <td>
                  <PlayerLink name={pick.prospect.fullName} id={pick.prospect.id} injury={injury} />
                </td>
              ) : (
                <td>{pick.prospect.fullName}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const SeasonOptions = () => {
    const seasonArray = [];

    for (let i = 2023; i > 1979; i -= 1) seasonArray.push(i);
    // TODO: use this call https://api.nhle.com/stats/rest/en/draft?sort=draftYear instead of hard coded date ?
    return seasonArray.map(s => (
      <option key={s} value={s.toString()}>
        {s.toString()}
      </option>
    ));
  };

  const handleChangeSeason = event => {
    setDraftInfo(null);
    navigate(`/draft/${event.target.value}`);
  };

  const seasonDropDown = () => (
    <table>
      <tbody>
        <tr>
          <th>Season</th>
          <td>
            <select onChange={handleChangeSeason} defaultValue={year}>
              {SeasonOptions()}
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  );

  if (draftInfo && draftInfo.drafts.length > 0) {
    return (
      <div className="cont">
        {seasonDropDown()}
        {draftInfo.drafts[0].rounds
          .sort((round1, round2) => round1.round - round2.round)
          .map(round => render_round(round))}
      </div>
    );
  }
  if (!Number.isNaN(Number(year)) && year !== '') {
    return (
      <div className="cont">
        <h1>Trying to fetch draft picks data from nhl api...</h1>
        <ClipLoader color="#fff" loading size={75} />
      </div>
    );
  }
  return <div>{seasonDropDown()}</div>;
}
