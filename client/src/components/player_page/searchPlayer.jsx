import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Loader
import ClipLoader from 'react-spinners/ClipLoader';

// images
import search from '../img/icons/search.png';

function SearchPlayer() {
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const search_players = searchValue => {
    if (searchValue.length > 0 && !isSearching) {
      setIsSearching(true);
      fetch(
        `https://nhl-pool-ethereum.herokuapp.com/https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/${searchValue}/10`
      ) // https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/Crosby/10
        .then(response => response.json())
        .then(result => {
          setSearchResult({ ...result });
          setIsSearching(false);
        });
      // .catch(error => {
      //   console.log(error);
      // });
    } else setSearchResult(null);
  };

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>
              <img src={search} alt="" />
            </td>
            <td>
              <input
                type="search"
                placeholder="Player name..."
                onChange={event => search_players(event.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="inFront">
        <table>
          <tbody>
            {isSearching ? (
              <tr>
                <td>
                  <ClipLoader color="#fff" loading size={25} />
                </td>
              </tr>
            ) : null}
            {searchResult?.suggestions?.map(player => {
              const p = player.split('|');
              return (
                <tr>
                  <td>
                    <Link to={`/playerInfo/'${p[0]}`}> {`${p[2]} ${p[1]}`}</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SearchPlayer;
