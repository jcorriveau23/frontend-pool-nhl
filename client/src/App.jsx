import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// css
import './components/components.css';
import './App.css';

// Logo of web site
import Logo from './components/img/logo/logo.svg';

// component
import TodayGamesFeed from './components/game_feed/dayGamesFeed';

// modals
import WrongNetworkModal from './modals/wrongNetwork';

// pages
import HomePage from './pages/home_page';
import LoginPage from './pages/login_page';
import ProfilePage from './pages/profile_page';
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

// always force https as protocol
if (window.location.protocol !== 'https:') {
  window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
}

function App() {
  const [user, setUser] = useState(null);
  const [contract, setContract] = useState(null);
  const [formatDate, setFormatDate] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  useEffect(() => {
    axios.get('https://nhl-pool-ethereum.herokuapp.com/');
  }, []);

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
                    <Link to="/my-pools">My Pools</Link>
                  </li>
                ) : null}
                {user ? (
                  <li>
                    <Link to="/my-bets">My Game Bets</Link>
                  </li>
                ) : null}
                <li>
                  <Link to="/standing">Standing</Link>
                </li>
                <li>
                  <Link to="/leaders">League leaders</Link>
                </li>
                <li>
                  <Link to="/player-info">Search Players</Link>
                </li>
                <li>
                  <Link to="/draft">Draft</Link>
                </li>
                <WalletCard
                  user={user}
                  setUser={setUser}
                  contract={contract}
                  setContract={setContract}
                  isWalletConnected={isWalletConnected}
                  setIsWalletConnected={setIsWalletConnected}
                  isWrongNetwork={isWrongNetwork}
                  setIsWrongNetwork={setIsWrongNetwork}
                />
              </div>
            </ul>
          </div>
        </nav>
      </div>
      <div>
        <TodayGamesFeed formatDate={formatDate} setFormatDate={setFormatDate} />
      </div>
      <div>
        <WrongNetworkModal isWalletConnected={isWalletConnected} isWrongNetwork={isWrongNetwork} />
        <Routes>
          <Route path="/" element={<HomePage formatDate={formatDate} />} />
          <Route path="/login" element={<LoginPage user={user} setUser={setUser} />} />
          <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route path="/my-pools" element={<MyPoolsPage user={user} />} />
          <Route path="/my-bets" element={<MyGameBetsPage user={user} contract={contract} />} />
          <Route path="/my-pools/:name" element={<PoolPage user={user} />} />
          <Route path="/standing" element={<StandingPage />} />
          <Route path="/game/:id" element={<GameFeedPage user={user} contract={contract} />} />
          <Route path="/player-info" element={<PlayerPage />} />
          <Route path="/player-info/:id" element={<PlayerPage />} />
          <Route path="/team-roster/:teamID/:season" element={<TeamRosterBySeasonPage />} />
          <Route path="/draft" element={<DraftPage />} />
          <Route path="/draft/:year" element={<DraftPage />} />
          <Route path="/leaders" element={<LeagueLeadersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
