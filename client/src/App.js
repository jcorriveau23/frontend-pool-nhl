import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';
import Cookies from 'js-cookie';

// css
import './components/components.css';
import './App.css';

// Logo of web site
import Logo from './components/img/logo/logo.svg';

// component
import TodayGamesFeed from './components/game_feed/dayGamesFeed';

// modals
import RegisterModal from './modals/register';

// pages
import HomePage from './pages/home_page';
import MyPoolsPage from './pages/myPools_page';
import PoolPage from './pages/pool_page';
import StandingPage from './pages/standing_page';
import GameFeedPage from './pages/game_feed_page';
import PlayerPage from './pages/player_page';
import TeamRosterBySeasonPage from './pages/teamRosterBySeason_page';
import MyGameBetsPage from './pages/myGameBets_page';
import DraftPage from './pages/draft_page';
import LeagueLeadersPage from './pages/leagueLeaders_page';

// components
import WalletCard from './components/web3/WalletCard';

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [user, setUser] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {}, []);

  const Disconnect = () => {
    Cookies.remove(`token-${user.addr}`);
    localStorage.clear('persist-account');
    window.location.reload(true);
  };

  return (
    <Router>
      <div className="header">
        <nav>
          <div>
            <ul>
              <div>
                <img src={Logo} alt="" width="100" height="75" />
              </div>
              <div className="inline-left-right">
                <li>
                  <Link to="/">Home</Link>
                </li>
                {user ? (
                  <li>
                    <Link to="/MyPools">My Pools</Link>
                  </li>
                ) : null}
                {user ? (
                  <li>
                    <Link to="/MyGameBets">My Game Bets</Link>
                  </li>
                ) : null}
                <li>
                  <Link to="/standing">Standing</Link>
                </li>
                <li>
                  <Link to="/leaders">League leaders</Link>
                </li>
                <li>
                  <Link to="/playerInfo">Search Players</Link>
                </li>
                <li>
                  <Link to="/draft">Draft</Link>
                </li>
                {user ? (
                  <li>
                    <Link to="/" onClick={() => Disconnect()}>
                      Disconnect
                    </Link>
                  </li>
                ) : null}
                <WalletCard user={user} setUser={setUser} contract={contract} setContract={setContract} />
              </div>
            </ul>
          </div>
        </nav>
      </div>
      <div>
        <TodayGamesFeed />
      </div>
      <div>
        <RegisterModal showRegisterModal={showRegisterModal} setShowRegisterModal={setShowRegisterModal} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/MyPools" element={<MyPoolsPage user={user} />} />
          <Route path="/MyGameBets" element={<MyGameBetsPage user={user} contract={contract} />} />
          <Route path="/MyPools/:name" element={<PoolPage user={user} />} />
          <Route path="/standing" element={<StandingPage />} />
          <Route path="/gameFeed/:id" element={<GameFeedPage user={user} contract={contract} />} />
          <Route path="/playerInfo" element={<PlayerPage />} />
          <Route path="/playerInfo/:id" element={<PlayerPage />} />
          <Route path="/teamRosterBySeason/:teamID/:season" element={<TeamRosterBySeasonPage />} />
          <Route path="/draft" element={<DraftPage />} />
          <Route path="/draft/:year" element={<DraftPage />} />
          <Route path="/leaders" element={<LeagueLeadersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
