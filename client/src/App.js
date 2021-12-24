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
import {LoginModal} from "./modals/login"

//pages
import MyPools from "./pages/myPools_page"
import PoolPage from "./pages/pool_page"
import StatsPage from "./pages/stats_page"
import GameFeedPage from "./pages/game_feed_page"
import PlayerPage from "./pages/player_page"
import TeamRosterBySeasonPage from "./pages/teamRosterBySeason_page"

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState("")
  const [addr, setAddr] = useState("")

  const ethereum = window.ethereum

  if(ethereum)
  {
    console.log(ethereum)
    ethereum.on('accountsChanged', function (accounts){
      setAddr(accounts[0])
    })
    console.log("listening")
  }


  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) { setUsername(username) }
  }, []);

  const openRegisterModal = () => {
    setShowRegisterModal(prev => !prev)
  }

  const openLoginModal = () => {
    setShowLoginModal(prev => !prev)
  }

  const Disconnect = () => {
    Cookies.remove('token')
    localStorage.clear("username")
    window.location.reload(true);
  }

  return(
      <Router>
      <div class="header">
        <nav>
          <div>
            <ul>
              <img src={Logo} width="100" height="75"></img>
              <li><Link to="/">Home</Link></li>
              {username? <li><Link to="/MyPools">My Pools</Link></li> : null}
              <li><Link to="/statsPage">League Stats</Link></li>
              <li onClick={openRegisterModal}><Link>Register</Link></li>
              {username? <li><Link onClick={() => Disconnect()}>Disconnect</Link></li> : <li onClick={openLoginModal}><Link>Login</Link></li>}
              {username?<li><Link>connected: {username}</Link></li> : null}
              {addr? <li>Your addr: {addr}</li> : <button>Connect your wallet</button>}
            </ul>
          </div>
        </nav>
        </div>
        <div>
          <TodayGamesFeed></TodayGamesFeed>
        </div>
        <div>
        <RegisterModal showRegisterModal={showRegisterModal} setShowRegisterModal={setShowRegisterModal}></RegisterModal>
        <LoginModal showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} username={username} setUsername={setUsername}></LoginModal>
        <Switch>
          <Route exact path="/MyPools" component = {() => MyPools(username)}></Route>
          <Route path="/MyPools/:name" component = {() => PoolPage(username)}></Route>
          <Route exact path="/statsPage" component = {StatsPage}></Route>
          <Route path="/gameFeed/:id" component = {() => GameFeedPage()}></Route>
          <Route path="/playerInfo/:id" component = {() => PlayerPage()}></Route>
          <Route path="/teamRosterBySeason/:teamID/:season" component = {() => TeamRosterBySeasonPage()}></Route>
        </Switch>
        </div>
      </Router>
  )
}

export default App;