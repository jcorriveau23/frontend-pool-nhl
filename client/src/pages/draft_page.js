// get the draft and display it on this page for a year

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import { logos } from '../components/img/logos';

export default function DraftPage() {
  const [draftInfo, setDraftInfo] = useState(null);
  const [prevYear, setPrevYear] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const year = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (prevYear !== year && !Number.isNaN(Number(year))) {
      fetch(`https://statsapi.web.nhl.com/api/v1/draft/${year}`, {
        // https://statsapi.web.nhl.com/api/v1/draft/2021
        method: 'GET',
      })
        .then(response => response.json())
        .then(dInfo => {
          // console.log(draftInfo)
          setDraftInfo(dInfo);
        });
      // .catch(error => {
      //   alert(`Error! ${error}`);
      // });

      setPrevYear(year);
    } else {
      navigate('/draft/2021');
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
                <img src={logos[pick.team.name]} alt="" width="30" height="30" />
              </td>
              {pick.prospect.id > 0 ? (
                <td>
                  <Link to={`/playerInfo/${pick.prospect.id}`} style={{ textDecoration: 'none', color: '#000099' }}>
                    {pick.prospect.fullName}
                  </Link>
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

    for (let i = 2021; i > 1979; i -= 1) seasonArray.push(i);
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
      <div>
        {seasonDropDown()}
        {draftInfo.drafts[0].rounds
          .sort((round1, round2) => round1.round - round2.round)
          .map(round => render_round(round))}
      </div>
    );
  }
  if (!Number.isNaN(Number(year)) && year !== '') {
    return (
      <div>
        <h1>Trying to fetch draft picks data from nhl api...</h1>
        <ClipLoader color="#fff" loading size={75} />
      </div>
    );
  }
  return <div>{seasonDropDown()}</div>;
}
