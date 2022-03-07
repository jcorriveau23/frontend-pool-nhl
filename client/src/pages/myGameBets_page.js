import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import BetItem from '../components/GameBet/betItem';

// css
import '../components/GameBet/betItem.css';

function MyGameBetsPage({ user, contract }) {
  const [userBets, setUserBets] = useState(null);

  useEffect(() => {
    if (contract) {
      contract.get_all_user_bets().then(bets => {
        const b = [];

        for (let i = 0; i < bets.length; i += 1) b.push(parseInt(bets[i], 10));

        setUserBets([...b]);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (user && userBets) {
    return (
      <div className="betItem">
        <h1>My Bets Page</h1>
        <ul>
          {userBets.map(id => (
            <Link to={`/gameFeed/${id}`} key={id}>
              <li>
                <BetItem user={user} contract={contract} gameID={id} />
              </li>
            </Link>
          ))}
        </ul>
      </div>
    );
  }

  return <h1>You are not connected.</h1>;
}
export default MyGameBetsPage;
