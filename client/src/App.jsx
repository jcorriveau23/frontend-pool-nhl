import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CgMenuRound } from 'react-icons/cg';

// css
import './components/components.css';
import './App.css';

// component
import TodayGamesFeed from './components/game_feed/dayGamesFeed';

// modals
import WrongNetworkModal from './modals/wrongNetwork';
import MenuModal from './modals/menu';
import AccountModal from './modals/account';

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
import SearchPlayer from './components/app/searchPlayer';

function App() {
  const [user, setUser] = useState(null);
  const [currentAddr, setCurrentAddr] = useState('');
  const [contract, setContract] = useState(null);
  const [formatDate, setFormatDate] = useState(null);
  const [date, setDate] = useState(new Date());
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [DictUsers, setDictUsers] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [injury, setInjury] = useState(null);
  const refMenu = useRef(null);
  const refAccount = useRef(null);

  useEffect(() => {
    axios.get('https://nhl-pool-ethereum.herokuapp.com/');

    axios.get('/injury.json').then(res => {
      setInjury(res.data);
    });

    const userTmp = JSON.parse(localStorage.getItem('persist-account'));

    if (userTmp) {
      console.log('try to fetch users');
      axios
        .get('/api-rust/users', {
          headers: { Authorization: `Bearer ${Cookies.get(`token-${userTmp._id.$oid}`)}` },
        })
        .then(res => {
          if (res.status === 200) {
            const DictUsersTmp = {};
            res.data.forEach(u => {
              DictUsersTmp[u._id.$oid] = u.name;
            });
            setDictUsers(DictUsersTmp);
            setUser(userTmp);
          }
        })
        .catch(err => {
          console.log(err);
          Cookies.remove(`token-${user._id.$oid}`);
          localStorage.clear('persist-account');
        });
    }
  }, []);

  return (
    <Router>
      <div className="header">
        <meta name="viewport" content="width=device-width" />
        <li className="menu" ref={refMenu}>
          <button onClick={() => setShowMenuModal(!showMenuModal)} type="button">
            <CgMenuRound size={80} />
          </button>
        </li>
        <li className="search-players">
          <SearchPlayer />
        </li>
        <li className="walle-card" ref={refAccount}>
          <WalletCard
            user={user}
            setContract={setContract}
            isWalletConnected={isWalletConnected}
            setIsWalletConnected={setIsWalletConnected}
            setIsWrongNetwork={setIsWrongNetwork}
            showAccountModal={showAccountModal}
            setShowAccountModal={setShowAccountModal}
            currentAddr={currentAddr}
            setCurrentAddr={setCurrentAddr}
          />
        </li>
      </div>
      <div className="cont">
        <TodayGamesFeed formatDate={formatDate} setFormatDate={setFormatDate} date={date} setDate={setDate} />
      </div>
      <div>
        <MenuModal
          user={user}
          isWalletConnected={isWalletConnected}
          showMenuModal={showMenuModal}
          setShowMenuModal={setShowMenuModal}
          buttonMenuRef={refMenu}
        />
        <AccountModal
          user={user}
          isWalletConnected={isWalletConnected}
          showAccountModal={showAccountModal}
          setShowAccountModal={setShowAccountModal}
          buttonAccountRef={refAccount}
        />
        <WrongNetworkModal isWalletConnected={isWalletConnected} isWrongNetwork={isWrongNetwork} />
        <Routes>
          <Route path="/" element={<HomePage formatDate={formatDate} injury={injury} />} />
          <Route
            path="/login"
            element={
              <LoginPage user={user} setUser={setUser} setCurrentAddr={setCurrentAddr} setDictUsers={setDictUsers} />
            }
          />
          <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route path="/my-pools" element={<MyPoolsPage user={user} DictUsers={DictUsers} />} />
          <Route path="/my-bets" element={<MyGameBetsPage user={user} contract={contract} />} />
          <Route
            path="/my-pools/:name"
            element={
              <PoolPage
                user={user}
                DictUsers={DictUsers}
                injury={injury}
                formatDate={formatDate}
                date={date}
                setDate={setDate}
              />
            }
          />
          <Route path="/standing" element={<StandingPage />} />
          <Route path="/game/:id" element={<GameFeedPage user={user} contract={contract} injury={injury} />} />
          <Route path="/player-info" element={<PlayerPage />} />
          <Route path="/player-info/:id" element={<PlayerPage />} />
          <Route path="/team-roster/:teamID/:season" element={<TeamRosterBySeasonPage injury={injury} />} />
          <Route path="/draft" element={<DraftPage injury={injury} />} />
          <Route path="/draft/:year" element={<DraftPage />} />
          <Route path="/leaders" element={<LeagueLeadersPage injury={injury} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
