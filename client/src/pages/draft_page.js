// get the draft and display it on this page for a year

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import logos from '../components/img/images';

function DraftPage() {
  const [draftInfo, setDraftInfo] = useState(null);
  const [prevYear, setPrevYear] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  var year = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (prevYear !== year && !isNaN(year)) {
      fetch('https://statsapi.web.nhl.com/api/v1/draft/' + year, {
        // https://statsapi.web.nhl.com/api/v1/draft/2021
        method: 'GET',
      })
        .then(response => response.json())
        .then(draftInfo => {
          //console.log(draftInfo)
          setDraftInfo(draftInfo);
        })
        .catch(error => {
          alert('Error! ' + error);
        });

      setPrevYear(year);
    } else {
      navigate('/draft/2021');
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const render_round = (roundInfo, i) => {
    return (
      <div key={i}>
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
            {roundInfo.picks.map((pick, i) => {
              return (
                <tr key={i}>
                  <td>{pick.pickOverall}</td>
                  <td>
                    <img src={logos[pick.team.name]} alt="" width="30" height="30"></img>
                  </td>
                  {pick.prospect.id > 0 ? (
                    <td>
                      <Link to={'/playerInfo/' + pick.prospect.id} style={{ textDecoration: 'none', color: '#000099' }}>
                        {pick.prospect.fullName}
                      </Link>
                    </td>
                  ) : (
                    <td>{pick.prospect.fullName}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const SeasonOptions = () => {
    var seasonArray = [];

    for (var i = 2021; i > 1979; i--) seasonArray.push(i);

    return seasonArray.map((s, i) => {
      return (
        <option key={i} value={s.toString()} selected={s.toString() === year ? 'selected' : null}>
          {s.toString()}
        </option>
      );
    });
  };

  const handleChangeSeason = event => {
    setDraftInfo(null);
    navigate('/draft/' + event.target.value);
  };

  const seasonDropDown = () => {
    return (
      <table>
        <tbody>
          <tr>
            <th>Season</th>
            <td>
              <select onChange={handleChangeSeason}>{SeasonOptions()}</select>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  if (draftInfo && draftInfo.drafts.length > 0) {
    return (
      <div>
        {seasonDropDown()}
        {draftInfo.drafts[0].rounds
          .sort((round1, round2) => {
            return round1.round - round2.round;
          })
          .map((round, i) => {
            return render_round(round, i);
          })}
      </div>
    );
  } else if (!isNaN(year) && year !== '') {
    return (
      <div>
        <h1>Trying to fetch draft picks data from nhl api...</h1>
        <ClipLoader color="#fff" loading={true} size={75} />
      </div>
    );
  } else {
    return <div>{seasonDropDown()}</div>;
  }
}

export default DraftPage;
