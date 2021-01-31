import React, { Component } from 'react';
import {BrowserRouter as Router, Link, Switch, Route} from "react-router-dom"

import Draft from "./components/draft"
import Register from "./components/register"
import Login from "./components/login"
import CreatePool from "./components/create_pool"
import PoolList from "./components/pool_list"

export default class App extends Component {
  render() {
    return(
      <Router>
      <div>
        <h2>Home</h2>
        <ul>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/create_pool">Create Pool</Link></li>
          <li><Link to="/pool_list">Pool List</Link></li>
          <li><Link to="/draft">Draft</Link></li>
        </ul>
        <Switch>
          <Route path="/register" component={Register}></Route>
          <Route path="/login" component={Login}></Route>
          <Route path="/create_pool" component={CreatePool}></Route>
          <Route path="/pool_list" component={PoolList}></Route>
          <Route path="/draft" component={Draft}></Route>
        </Switch>
      </div>
      </Router>
    )
  }
}