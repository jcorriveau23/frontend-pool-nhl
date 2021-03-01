import React, { Component } from 'react';
import Cookies from 'js-cookie';
import io from "socket.io-client";
import Tabs from "./Tabs"

import './poolMatchMaking.css';

const socket = io("http://localhost:8080")

// TODO, parameters received from game creation settings
const MAX_FORWARD = 12;
const MAX_DEFENSE = 6;
const MAX_GOALTENDER = 2;
const MAX_RESERVIST = 4;

export default class PoolMatchMaking extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            pool_info: {},

            pool_name: "",
            user_list: [],

            // Draft
            def_l: [],
            forw_l: [],
            goal_l: [],
            na_l: [],

            selected_player: {name: "select a player", team: " - ", role: " - "},

            number_forward_chosen: 0,
            number_defender_chosen: 0,
            number_goalies_chosen: 0,
            number_reservist_chosen: 0,

        }
        this.handleChange = this.handleChange.bind(this);
        this.componentCleanup = this.componentCleanup.bind(this);
    };
        
    async componentWillMount(){
      window.addEventListener('beforeunload', this.componentCleanup);

      var pool_name = await this.props.match.params.name
      socket.emit('joinRoom', Cookies.get('token'), pool_name);
      console.log('Joined Room');

      // socket listening event
      socket.on('roomData', (data) => {
        console.log("user list changed: " + data)
        this.setState({user_list: data})
      });

      socket.on("error", (data) => {
        console.log("Error: " + data)
      });

      socket.on("poolInfo", (data) => {
        console.log("Error: " + data)
        this.setState({pool_info: data})
      });

    }

    async componentCleanup(){
      console.log("leaving pool: " + this.state.pool_name)
      socket.emit('leaveRoom', Cookies.get('token'), this.state.pool_name);
      socket.off('roomData');
    }

    async componentDidMount() {
      this.fetchPlayerDraft()
      var pool_name = await this.props.match.params.name
      this.setState({pool_name: pool_name})   
      
      var cookie = Cookies.get('token')

      // validate login
      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': cookie}
      };
      fetch('http://localhost:3000/auth/get_user', requestOptions)
      .then(response => response.json())
      .then(data => {
          if(data.success === "False"){
              this.props.history.push('/login');
          }
          else{
            console.log(data.username)
            this.setState({username: data.username})
          }
      })
      
      // get pool info at start
      const requestOptions2 = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': cookie, 'pool_name': pool_name}
      };
      fetch('http://localhost:3000/pool/get_pool_info', requestOptions2)
      .then(response => response.json())
      .then(data => {
          if(data.success === "False"){
              this.props.history.push('/pool_list');
          }
          else{
            console.log(data.message.context)
            this.setState({pool_info: data.message})
          }
          
      })


    }
    
    async componentWillUnmount(){
      this.componentCleanup();
      window.removeEventListener('beforeunload', this.componentCleanup); // remove the event handler for normal unmounting
    }

    // Draft methods
    async fetchPlayerDraft(){
      const response = await fetch('/player_list');
      const json = await response.json();

      this.setState({
        def_l: json["Def"],
        forw_l: json["For"],
        goal_l: json["Gol"],
        na_l: json["N/A"]
      })
    
      await this.sort_by_number("goals", "D")
    }

    async sort_by_number(stats, position){
      var array;
      if(position === "D"){
        array = this.state.def_l;
        array = await this.sort_by_stats(stats, array)
        this.setState({def_l: array})
      }
      else if(position === "F"){
        array = this.state.forw_l;
        array = await this.sort_by_stats(stats, array)
        this.setState({forw_l: array})
      }
      else if(position === "G"){
        array = this.state.goal_l;
        array = await this.sort_by_stats(stats, array)
        this.setState({goal_l: array})
      }
      else{
        array = this.state.na_l;
        array = await this.sort_by_stats(stats, array)
        this.setState({na_l: array})
      }
  
    }
  
    async sort_by_stats(stats, array){
      if(stats === "goals"){
        array.sort(function(a, b) {
          return b.stats.goals - a.stats.goals;
        });
      }
      else if(stats === "assists"){
        array.sort(function(a, b) {
          return b.stats.assists - a.stats.assists;
        });
      }
      else if(stats === "games"){
        array.sort(function(a, b) {
          return b.stats.games - a.stats.games;
        });
      }
      else if(stats === "wins"){
        array.sort(function(a, b) {
          return b.stats.wins - a.stats.wins;
        });
      }
      else if(stats === "losses"){
        array.sort(function(a, b) {
          return b.stats.losses - a.stats.losses;
        });
      }
      else if(stats === "savePercentage"){
        array.sort(function(a, b) {
          return b.stats.savePercentage - a.stats.savePercentage;
        });
      }
      return array
    }
    
    async player_selection(name, team, role){
      this.setState({selected_player: {name: name, team: team, role: role}})
    }
  
    async chose_player(player){
      console.log(player.name)

      socket.emit('pickPlayer', Cookies.get('token'), this.state.pool_info.name, player)
      
    }

    async handleChange(event) {
      if(event.target.type == "checkbox"){
        if(event.target.checked){
          socket.emit('playerReady', Cookies.get('token'), this.state.pool_info.name);
        }
        else{
          socket.emit('playerNotReady', Cookies.get('token'), this.state.pool_info.name);
        }
      }

      else if(event.target.type == "submit"){
        socket.emit('startDraft', Cookies.get('token'), this.state.pool_info.name);
      }
      
    }
  
    render() {

      const startDraftButton = () => {
        if(this.state.username === this.state.pool_info.owner){
          return <button onClick={this.handleChange}>Start draft</button>
        }
        else{
          return
        }
      }

      const render_defender = () => {
        if(this.state.pool_info['context'][this.state.username]){
          return this.state.pool_info['context'][this.state.username]['chosen_defender'].map((player, index) =>
          <tr>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.team}</td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_forward = () => {
        if(this.state.pool_info['context'][this.state.username]){
          return this.state.pool_info['context'][this.state.username]['chosen_forward'].map((player, index) =>
          <tr>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.team}</td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_reservist = () => {
        if(this.state.pool_info['context'][this.state.username]){
          return this.state.pool_info['context'][this.state.username]['chosen_reservist'].map((player, index) =>
          <tr>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.team}</td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_goalies = () => {
        if(this.state.pool_info['context'][this.state.username]){
          return this.state.pool_info['context'][this.state.username]['chosen_goalies'].map((player, index) =>
          <tr>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>{player.team}</td>
          </tr>
        )
        }
        else{
          return
        }
      }

      if(this.state.pool_info.status === "created"){
        return(
          <div class="container">
            <h1>Match Making for Pool {this.state.pool_info.name}</h1>
            <div class="floatLeft">
              <h2>Rule: </h2>
              <h4>Number poolers: {this.state.pool_info.number_poolers}</h4>
              <h4>Number forwards: {this.state.pool_info.number_forward}</h4>
              <h4>Number defenders: {this.state.pool_info.number_defenders}</h4>
              <h4>Number goalies: {this.state.pool_info.number_goalies}</h4>
              <h4>Number reservist: {this.state.pool_info.number_reservist}</h4>
              <h2>Points</h2>
              <h4>Goals by forward: {this.state.pool_info.forward_pts_goals} pts</h4>
              <h4>Assists by forward: {this.state.pool_info.forward_pts_assists} pts</h4>
              <h4>Hat tricks by forward: {this.state.pool_info.forward_pts_hattricks} pts</h4>
              <h4>Goals by defender: {this.state.pool_info.defender_pts_goals} pts</h4>
              <h4>Assists by defender: {this.state.pool_info.defender_pts_assists} pts</h4>
              <h4>Hat tricks by defender: {this.state.pool_info.defender_pts_hattricks} pts</h4>
              <h4>Win by goalies: {this.state.pool_info.goalies_pts_wins} pts</h4>
              <h4>shutouts by goalies: {this.state.pool_info.goalies_pts_shutouts} pts</h4>
              <h4>Goals by goalies: {this.state.pool_info.goalies_pts_goals} pts</h4>
              <h4>Assists by goalies: {this.state.pool_info.goalies_pts_assists} pts</h4>
            </div>
            <div class="floatRight">
              <label>
                <input
                  type="checkbox"
                  onChange={this.handleChange}
                /> Ready?
              </label>
              {startDraftButton()}
              <h2>Participants: </h2>
              {this.state.user_list.map(user =>
              <li>{user.name} => Ready: {user.ready.toString()}</li>
              )}
            </div>
          </div>
        )
      }
      else if(this.state.pool_info.status === "draft"){
        return(
          <div>
            <h1>Draft for pool {this.state.pool_info.name}</h1>
            <div class="container">
            <h1>Stats derniere saison</h1>
            <div class="floatLeft">
            <Tabs>
            <div label="def">
            <h2>Defenseur</h2>
            <table border="1">
              <tbody>
              <tr>
                <th>name</th>
                <th>team</th>
                <th onClick={() => this.sort_by_number("games", "D")}>Games played</th>
                <th onClick={() => this.sort_by_number("goals", "D")}>Goals</th>
                <th onClick={() => this.sort_by_number("assists", "D")}>Assists</th>
                <th>pts</th>
              </tr>
              {this.state.def_l.map(player => 
                <tr onClick={() => this.player_selection(player.name, player.team, "D")}>
                  <td>{player.name}</td>
                  <td>{player.team}</td>
                  <td>{player.stats.games}</td>
                  <td>{player.stats.goals}</td>
                  <td>{player.stats.assists}</td>
                  <td>{player.stats.goals + player.stats.assists}</td>
                </tr>
                )}
                </tbody>
            </table>
            </div>
            <div label="fow">
            <h2>Attaquant</h2>
              <table border="1">
                <tbody>
                <tr>
                  <th>name</th>
                  <th>team</th>
                  <th onClick={() => this.sort_by_number("games", "F")}>Games played</th>
                  <th onClick={() => this.sort_by_number("goals", "F")}>Goals</th>
                  <th onClick={() => this.sort_by_number("assists", "F")}>Assists</th>
                  <th>pts</th>
                </tr>
                {this.state.forw_l.map(player => 
                  <tr onClick={() => this.player_selection(player.name, player.team, "F")}>
                    <td>{player.name}</td>
                    <td>{player.team}</td>
                    <td>{player.stats.games}</td>
                    <td>{player.stats.goals}</td>
                    <td>{player.stats.assists}</td>
                    <td>{player.stats.goals + player.stats.assists}</td>
                  </tr>
                  )}
                  </tbody>
              </table>
            </div> 
            <div label="gol">
            <h2>Goalers</h2>
              <table border="1">
                <tbody>
                <tr>
                  <th>name</th>
                  <th>team</th>
                  <th onClick={() => this.sort_by_number("games", "G")}>Games played</th>
                  <th onClick={() => this.sort_by_number("wins", "G")}>Win</th>
                  <th onClick={() => this.sort_by_number("losses", "G")}>losses</th>
                  <th onClick={() => this.sort_by_number("savePercentage", "G")}>save percentage</th>
                </tr>
                {this.state.goal_l.map(player => 
                  <tr onClick={() => this.player_selection(player.name, player.team, "G")}>
                    <td>{player.name}</td>
                    <td>{player.team}</td>
                    <td>{player.stats.games}</td>
                    <td>{player.stats.wins}</td>
                    <td>{player.stats.losses}</td>
                    <td>{player.stats.savePercentage}</td>
                  </tr>
                  )}
                  </tbody>
              </table>
              </div>
              <div label="N/A">
                <h2>N/A</h2>
                  <table border="1">
                    <tbody>
                    <tr>
                      <th>name</th>
                      <th>team</th>
                      <th onClick={() => this.sort_by_number("games", "N/A")}>Games played</th>
                      <th onClick={() => this.sort_by_number("goals", "N/A")}>Goals</th>
                      <th onClick={() => this.sort_by_number("assists", "N/A")}>Assists</th>
                      <th >pts</th>
                    </tr>
                    {this.state.na_l.map(player => 
                      <tr onClick={() => this.player_selection(player.name, player.team, "G")}>
                        <td>{player.name}</td>
                        <td>{player.team}</td>
                        <td>{player.stats.games}</td>
                        <td>{player.stats.goals}</td>
                        <td>{player.stats.assists}</td>
                        <td>{player.stats.goals + player.stats.assists}</td>
                      </tr>
                      )}
                      </tbody>
                  </table>
              </div>
              </Tabs>
              </div>
            <div class="floatRight">
                <div class="floatLeft">
                  <h2>{this.state.pool_info.next_drafter}'s turn</h2>
                  <h3>{this.state.selected_player.name}</h3>
                  <button onClick={() => this.chose_player(this.state.selected_player)}>choose</button>
                </div>
                <div class="floatRight">
                <h1>My Team</h1>
                  <table border="1">
                    <h3>Forward</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_forward()}
                    <h3>Def</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_defender()}
                    <h3>Goalies</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_goalies()}
                    <h3>Reservist</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_reservist()}
                  </table>
                </div>
              </div>
            </div>  
          </div>
        )
      }
      else{
        return(
          <div>
            <h1>trying to fetch pool data info...</h1>
          </div>
        )
      }
      
    }
}