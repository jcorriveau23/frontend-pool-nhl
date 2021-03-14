import React, { Component } from 'react';
import Cookies from 'js-cookie';
import io from "socket.io-client";
import Tabs from "./Tabs"

import './poolMatchMaking.css';

const socket = io.connect()

export default class PoolMatchMaking extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            pool_info: {participants: []},

            pool_name: "",
            user_list: [],

            message: "",

            // Draft
            def_l: [],
            forw_l: [],
            goal_l: [],
            na_l: [],

            selected_player: {name: "select a player", team: " - ", role: " - "},

            number_forward_chosen: 0,
            number_defender_chosen: 0,
            number_goalies_chosen: 0,
            number_reservist_chosen: 0
        }
        this.handleChange = this.handleChange.bind(this);
        this.componentCleanup = this.componentCleanup.bind(this);
    };
        
    async componentWillMount(){
      window.addEventListener('beforeunload', this.componentCleanup);

      var pool_name = await this.props.match.params.name
      socket.emit('joinRoom', Cookies.get('token'), pool_name);
      console.log('Joined Room');

      socket.on('roomData', (data) => {
        console.log("user list changed: " + data)
        this.setState({user_list: data})
      });

      socket.on("error", (data) => {
        console.log("Error: " + data)
      });

      socket.on("poolInfo", (data) => {
        console.log(data)
        this.setState({pool_info: data})
        this.filter_players(this.state.pool_info.number_poolers)
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
      fetch('../auth/get_user', requestOptions)
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
      fetch('../pool/get_pool_info', requestOptions2)
      .then(response => response.json())
      .then(data => {
          if(data.success === "False"){
              this.props.history.push('/pool_list');
          }
          else{
            this.setState({pool_info: data.message})
          }
          this.filter_players(this.state.pool_info.number_poolers)
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

      socket.emit('pickPlayer', Cookies.get('token'), this.state.pool_info.name, player, (ack)=>{
        if(ack.success === "False"){
          this.setState({message: ack.message})
        }
        else{
          this.setState({message: ""})
        }
      })
      
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

    async filter_players(number_poolers){

      if(this.state.pool_info.status == "draft"){
        var def_picked_l = []
        var forward_picked_l = []
        var goalies_picked_l = []
  
        var participant
  
        var filtered_def_l = []
        var filtered_forward_l = []
        var filtered_goalies_l = []
  
  
        for(var i = 0; i < number_poolers; i++){
          participant = this.state.pool_info.participants[i]
          
          def_picked_l = def_picked_l.concat(this.state.pool_info.context[participant].chosen_defender)
          forward_picked_l = def_picked_l.concat(this.state.pool_info.context[participant].chosen_forward)
          goalies_picked_l = def_picked_l.concat(this.state.pool_info.context[participant].chosen_goalies)

          def_picked_l = def_picked_l.concat(this.state.pool_info.context[participant].chosen_reservist)
          forward_picked_l = def_picked_l.concat(this.state.pool_info.context[participant].chosen_reservist)
          goalies_picked_l = def_picked_l.concat(this.state.pool_info.context[participant].chosen_reservist)
        }
        
        filtered_def_l = await this.filterArray(this.state.def_l, def_picked_l)
        filtered_forward_l = await this.filterArray(this.state.forw_l, forward_picked_l)
        filtered_goalies_l = await this.filterArray(this.state.goal_l, goalies_picked_l)
  
        this.setState({def_l: filtered_def_l})
        this.setState({forw_l: filtered_forward_l})
        this.setState({goal_l: filtered_goalies_l})
      }

    }

    async filterArray(arr1, arr2){
      const filtered = arr1.filter(e1 => {
         return (arr2.findIndex(e2 => 
           e2.name === e1.name && e2.team === e1.team
         ) === -1);
      });
      
      return filtered;
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

      const render_defender = (pooler) => {
        if(this.state.pool_info['context'][pooler]){
          return this.state.pool_info['context'][pooler]['chosen_defender'].map((player, index) =>
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

      const render_forward = (pooler) => {
        if(this.state.pool_info['context'][pooler]){
          return this.state.pool_info['context'][pooler]['chosen_forward'].map((player, index) =>
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

      const render_reservist = (pooler) => {
        if(this.state.pool_info['context'][pooler]){
          return this.state.pool_info['context'][pooler]['chosen_reservist'].map((player, index) =>
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

      const render_goalies = (pooler) => {
        if(this.state.pool_info['context'][pooler]){
          return this.state.pool_info['context'][pooler]['chosen_goalies'].map((player, index) =>
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

      const isUser = (participant) => {
        return participant === this.state.username
      }

      const render_tabs_choice = () => {
        if(this.state.pool_info['participants']){
          var array = this.state.pool_info['participants']
          var index = array.findIndex(isUser)
          array.splice(index, 1)
          array.splice(0, 0, this.state.username)

          return <Tabs>
                  {array.map(pooler =>
                      <div label={pooler}>
                        <table border="1">
                    <h3>Forward</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_forward(pooler)}
                    <h3>Def</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_defender(pooler)}
                    <h3>Goalies</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_goalies(pooler)}
                    <h3>Reservist</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_reservist(pooler)}
                  </table>
                      </div>
                  )}
          </Tabs>
          
        }
        else{
          return
        }
      }

      const render_color_user_turn = () => {
        if(this.state.pool_info.next_drafter === this.state.username){
          return <h2 class="green-text">{this.state.pool_info.next_drafter}'s turn</h2>
        }
        else{
          return <h2 class="red-text">{this.state.pool_info.next_drafter}'s turn</h2>
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
            <h1>Stats last season</h1>
            <div class="floatLeft">
            <Tabs>
            <div label="defense">
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
            <div label="forward">
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
            <div label="goalies">
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
                  {render_color_user_turn()}
                  <h1>{this.state.selected_player.name}</h1>
                  <h3 class="red-text">{this.state.message}</h3>
                  <button onClick={() => this.chose_player(this.state.selected_player)}>choose</button>
                </div>
                <div class="floatRight">
                  {render_tabs_choice()}

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