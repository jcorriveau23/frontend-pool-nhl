import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Link, Switch, Route} from "react-router-dom"
import Cookies from 'js-cookie';

// css
import './components/components.css';

// Logo of web site
import Logo from "./components/img/logo/logo.svg"

// component
import TodayGamesFeed from "./components/game_feed/todayGamesFeed"

// modals
import {RegisterModal} from "./modals/register"

//pages
import MyPoolsPage from "./pages/myPools_page"
import PoolPage from "./pages/pool_page"
import StatsPage from "./pages/stats_page"
import GameFeedPage from "./pages/game_feed_page"
import PlayerPage from "./pages/player_page"
import TeamRosterBySeasonPage from "./pages/teamRosterBySeason_page"
import MyGameBetsPage from './pages/myGameBets_page';

// components
import WalletCard from './components/web3/WalletCard';

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [user, setUser] = useState(null)
  const [contract, setContract] = useState(null)

  useEffect(() => {
  }, []);

  const openRegisterModal = () => {
    setShowRegisterModal(prev => !prev)
  }

  const Disconnect = () => {
    Cookies.remove('token-'+ user.addr)
    localStorage.clear("persist-account")
    window.location.reload(true);
  }

  return(
      <Router>
      <div class="header">
        <nav>
          <div>
            <ul>
              <img src={Logo} alt="" width="100" height="75"></img>
              <li><Link to="/">Home</Link></li>
              {user? <li><Link to="/MyPools">My Pools</Link></li> : null}
              {user? <li><Link to="/MyGameBets">My Game Bets</Link></li> : null}
              <li><Link to="/statsPage">League Stats</Link></li>
              {user? <li><Link onClick={() => Disconnect()}>Disconnect</Link></li> : null}
              <WalletCard user={user} setUser={setUser} contract={contract} setContract={setContract}/>
            </ul>
          </div>
        </nav>
        </div>
        <div>
          <TodayGamesFeed></TodayGamesFeed>
        </div>
        <div>
        <RegisterModal showRegisterModal={showRegisterModal} setShowRegisterModal={setShowRegisterModal}></RegisterModal>
        <Switch>
          <Route exact path="/MyPools" component = {() => MyPoolsPage(user)}></Route>
          <Route exact path="/MyGameBets" component = {() => MyGameBetsPage({user, contract})}></Route>
          <Route path="/MyPools/:name" component = {() => PoolPage(user)}></Route>
          <Route exact path="/statsPage" component = {StatsPage}></Route>
          <Route path="/gameFeed/:id" component = {() => GameFeedPage({user, contract})}></Route>
          <Route path="/playerInfo/:id" component = {() => PlayerPage()}></Route>
          <Route path="/teamRosterBySeason/:teamID/:season" component = {() => TeamRosterBySeasonPage()}></Route>
        </Switch>
        </div>
      </Router>
  )
}

export default App;