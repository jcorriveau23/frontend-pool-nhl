import React, { useState } from 'react';
import {BrowserRouter as Router, Link, Switch, Route} from "react-router-dom"

// modals
import {RegisterModal} from "./modals/register"
import {LoginModal} from "./modals/login"

//pages
import CreatePool from "./components/create_pool"
import PoolList from "./components/pool_list"
import PoolMatchMaking from "./components/PoolMatchMaking"
import Cookies from 'js-cookie';

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState("")

  const openRegisterModal = () => {
    setShowRegisterModal(prev => !prev)
  }

  const openLoginModal = () => {
    setShowLoginModal(prev => !prev)
  }

  const onDisconnect = () => {
    Cookies.remove('token')
    window.location.reload(true);
  }

  return(
      <Router>
      <div class="back-site">
        <nav>
          <div>
            <div>
              <a><Link to="/">Pool JDope</Link></a>
            </div>
            <ul>
              <li onClick={openRegisterModal}>Register</li>
              <li onClick={openLoginModal}>Login</li>
              <li><Link to="/create_pool">Create Pool</Link></li>
              <li><Link to="/pool_list">Pool List</Link></li>
              <li><Link onClick={() => onDisconnect()}>Disconnect</Link></li>
            </ul>
          </div>
        </nav>
        <RegisterModal showRegisterModal={showRegisterModal} setShowRegisterModal={setShowRegisterModal}></RegisterModal>
        <LoginModal showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal}></LoginModal>
        <Switch>
          <Route path="/create_pool" component={CreatePool}></Route>
          <Route exact path="/pool_list" component={PoolList}></Route>
          <Route path="/pool_list/:name" component = {PoolMatchMaking}></Route>
        </Switch>
      </div>
      </Router>
  )
}

export default App;