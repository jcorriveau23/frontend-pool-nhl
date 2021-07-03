import React, { Component } from 'react';
import {BrowserRouter as Router, Link, Switch, Route} from "react-router-dom"

import Register from "./components/register"
import Login from "./components/login"
import CreatePool from "./components/create_pool"
import PoolList from "./components/pool_list"
import PoolMatchMaking from "./components/PoolMatchMaking"
import Cookies from 'js-cookie';

export default class App extends Component {

  constructor(props) {
    super(props);
      // variable from this page
      this.state = {
          username: ""
      }
  };

  async componentDidMount() {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token')}
    };
    fetch('auth/get_user', requestOptions)
    .then(response => response.json())
    .then(data => {
        if(data.success === "True"){
            this.setState({username: data.username})
        }
    })
  }

  async onDisconnect() {
    Cookies.remove('token')
    console.log("Disconnecting")
    window.location.reload(true);
  }

  render() {
    return(
      <Router>
      <div>
        <h1>Home</h1>
        <h2>Welcome {this.state.username}</h2>
        <ul>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/create_pool">Create Pool</Link></li>
          <li><Link to="/pool_list">Pool List</Link></li>
          <li><Link onClick={() => this.onDisconnect()}>Disconnect</Link></li>
        </ul>
        <Switch>
          <Route path="/register" component={Register}></Route>
          <Route path="/login" component={Login}></Route>
          <Route path="/create_pool" component={CreatePool}></Route>
          <Route exact path="/pool_list" component={PoolList}></Route>
          <Route path="/pool_list/:name" component = {PoolMatchMaking}></Route>
        </Switch>
      </div>
      </Router>
    )
  }
}