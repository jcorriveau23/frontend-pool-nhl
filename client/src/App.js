import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Link, Switch, Route} from "react-router-dom"
import Cookies from 'js-cookie';

// css
import './components/components.css';

// Logo of web site
import Logo from "./components/img/logo/logo.png"

// component
import TodayGamesFeed from "./components/todayGamesFeed"

// modals
import {RegisterModal} from "./modals/register"
import {LoginModal} from "./modals/login"

//pages
import PoolList from "./pages/pool_list"
import PoolPage from "./pages/pool_page"
import StatsPage from "./pages/stats_page"

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState("")

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setUsername(username);
    }
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
              <li><img src={Logo} width="50" height="50"></img></li>
              <li><Link to="/">Home</Link></li>
              {username? <li><Link to="/poolList">Pool List</Link></li> : null}
              <li><Link to="/statsPage">League Stats</Link></li>
              <li onClick={openRegisterModal}><a href="#">Register</a></li>
              {username? <li><Link onClick={() => Disconnect()}>Disconnect</Link></li> : <li onClick={openLoginModal}><a href="#">Login</a></li>}
              {username?<li><a href="#">connected: {username}</a></li> : null}
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
          <Route exact path="/poolList" component = {() => PoolList(username)}></Route>
          <Route path="/poolList/:name" component = {() => PoolPage(username)}></Route>
          <Route exact path="/statsPage" component = {StatsPage}></Route>
        </Switch>
        </div>
      </Router>
  )
}

export default App;