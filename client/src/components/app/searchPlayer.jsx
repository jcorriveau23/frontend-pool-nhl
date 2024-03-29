import React, { useState, useRef } from 'react';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

// images
import { FiSearch } from 'react-icons/fi';
import { team_info } from '../img/logos';

import './searchPlayer.css';

function SearchPlayer({ OnSearchPlayerClicked }) {
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const refDiv = useRef(null);
  const refInput = useRef(null);

  const search_players = async searchValue => {
    if (searchValue.length > 2 && !isSearching) {
      setIsSearching(true);
      setSearchResult(null);

      try {
        const res = await axios.get(
          `https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=10&q=${searchValue}`
        );
        setSearchResult(res.data);
      } catch (e) {
        alert(e);
      }

      setIsSearching(false);
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

  const onPlayerClicked = player => {
    setSearchResult(null);
    refInput.current.value = '';
    OnSearchPlayerClicked(player);
  };

  return (
    <div ref={refDiv}>
      <button onClick={() => refInput.current.focus()} type="button">
        <table>
          <tbody>
            <tr>
              <td>
                <FiSearch size={71} />
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
      {searchResult?.length > 0 ? (
        <div className="results">
          <table className="results_table">
            {isSearching ? <ClipLoader color="#fff" loading size={35} /> : null}
            {searchResult.map(player => (
              <tr key={player.playerId} onClick={() => onPlayerClicked(player)}>
                <td>{`${player.name} (${player.positionCode})`}</td>
                <td>
                  <img src={team_info[player.teamId ?? 0]?.logo} alt="" width="70" height="70" />
                </td>
              </tr>
            ))}
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default SearchPlayer;
