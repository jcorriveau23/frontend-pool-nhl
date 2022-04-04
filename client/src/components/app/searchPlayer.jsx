import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// images
import { FiSearch } from 'react-icons/fi';

import './searchPlayer.css';

function SearchPlayer() {
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const refDiv = useRef(null);
  const refInput = useRef(null);

  const search_players = searchValue => {
    if (searchValue.length > 0 && !isSearching) {
      setIsSearching(true);
      axios
        .get(
          `https://nhl-pool-ethereum.herokuapp.com/https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/${searchValue}/10`
        ) // https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/Crosby/10
        .then(res => {
          setSearchResult({ ...res.data });
          setIsSearching(false);
        });
      // .catch(error => {
      //   console.log(error);
      // });
    } else {
      setSearchResult(null);
    }

    // Since we disabled the overlay we need to add a custom way of closing the modal when clicking outside of the modal.
    const handleClickOutside = event => {
      if (refDiv.current && !refDiv.current.contains(event.target)) {
        setSearchResult(null);
        refInput.current.value = '';
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  };

  const link_to = dest => {
    setSearchResult(null);
    refInput.current.value = '';
    navigate(dest);
  };

  return (
    <div ref={refDiv}>
      <button onClick={() => refInput.current.focus()} type="button">
        <table>
          <tbody>
            <tr>
              <td>
                <FiSearch size={45} />
              </td>
              <td>
                <input
                  ref={refInput}
                  className="search_input"
                  type="search"
                  placeholder="Player name..."
                  onChange={event => search_players(event.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </button>
      {searchResult?.suggestions?.length > 0 ? (
        <div className="results">
          <table className="results_table">
            {searchResult?.suggestions?.map(player => {
              const p = player.split('|');
              return (
                <tr onClick={() => link_to(`/player-info/${p[0]}`)}>
                  <td>{`${p[2]} ${p[1]}`}</td>
                </tr>
              );
            })}
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default SearchPlayer;
