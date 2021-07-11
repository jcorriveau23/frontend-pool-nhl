import React, { Component } from 'react';
import Cookies from 'js-cookie';
import io from "socket.io-client";
import Tabs from "./Tabs"

import logos from "./img/images"
import './components.css';

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

            forw_protected: [],
            def_protected: [],
            goal_protected: [],
            reserv_protected: [],

            not_protected_forwards: [],
            not_protected_defenders: [],
            not_protected_goalies: [],
            not_protected_reservists: [],

            player_stats: {},
            ranking: [],

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
        this.filter_players()
      });
    }

    async componentCleanup(){
      console.log("leaving pool: " + this.state.pool_name)
      socket.emit('leaveRoom', Cookies.get('token'), this.state.pool_name);
      socket.off('roomData');
    }

    async componentDidMount() {
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
          this.filter_players()
          
          if(this.state.pool_info.status === "in Progress")
          {
            const requestOptions3 = {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'token': cookie, 'pool_name': pool_name}
            };
            fetch('../pool/get_pool_stats', requestOptions3)
            .then(response => response.json())
            .then(data => {
                if(data.success === "False"){
                    this.props.history.push('/pool_list');
                }
                else{
                  //TODO: Store the pool stats into state
                  this.calculate_pool_stats(data.players)

                }
              })
          }
          else if(this.state.pool_info.status === "dynastie"){
            this.filter_protected_players()
          }
          else{
          
            this.fetchPlayerDraft() // all draftable players data base
            
          }
          
      })



      
    }

    async calculate_pool_stats(players_stats){
      var stats = {}
      var pooler
      var player

      var ranking = []

      for(var i = 0; i < this.state.pool_info.participants.length; i++){
        pooler = this.state.pool_info.participants[i]

        stats[pooler] = {}
        stats[pooler]["chosen_forward"] = []

        stats[pooler]["forwards_total_pts"] = 0 // TODO, calculate each of them to include in stats[pooler][x_total_points] and show them 
        stats[pooler]["defenders_total_pts"] = 0
        stats[pooler]["goalies_total_pts"] = 0
        stats[pooler]["reservists_total_pts"] = 0

        for(var j = 0; j < this.state.pool_info.context[pooler].chosen_forward.length; j++){
          player = players_stats.find(p => p.name === this.state.pool_info.context[pooler].chosen_forward[j].name)
          player["pool_points"] = this.state.pool_info.forward_pts_goals*player.stats.goals + this.state.pool_info.forward_pts_assists*player.stats.assists //+ hat trick
          stats[pooler]["forwards_total_pts"] += this.state.pool_info.forward_pts_goals*player.stats.goals + this.state.pool_info.forward_pts_assists*player.stats.assists

          stats[pooler]["chosen_forward"].push(player)
        }

        stats[pooler]["chosen_defender"] = []

        for(var j = 0; j < this.state.pool_info.context[pooler].chosen_defender.length; j++){
          player = players_stats.find(p => p.name === this.state.pool_info.context[pooler].chosen_defender[j].name)
          player["pool_points"] = this.state.pool_info.defender_pts_goals*player.stats.goals + this.state.pool_info.defender_pts_assits*player.stats.assists //+ hat trick 
          stats[pooler]["defenders_total_pts"] += this.state.pool_info.defender_pts_goals*player.stats.goals + this.state.pool_info.defender_pts_assits*player.stats.assists //+ hat trick  
          
          stats[pooler]["chosen_defender"].push(player)
        }

        stats[pooler]["chosen_goalies"] = []

        for(var j = 0; j < this.state.pool_info.context[pooler].chosen_goalies.length; j++){
          player = players_stats.find(p => p.name === this.state.pool_info.context[pooler].chosen_goalies[j].name)
          player["pool_points"] = this.state.pool_info.goalies_pts_wins*player.stats.wins + this.state.pool_info.goalies_pts_shutouts*player.stats.shutouts
          stats[pooler]["goalies_total_pts"] += this.state.pool_info.goalies_pts_wins*player.stats.wins + this.state.pool_info.goalies_pts_shutouts*player.stats.shutouts

          stats[pooler]["chosen_goalies"].push(player)
        }

        stats[pooler]["chosen_reservist"] = []

        for(var j = 0; j < this.state.pool_info.context[pooler].chosen_reservist.length; j++){
          player = players_stats.find(p => p.name === this.state.pool_info.context[pooler].chosen_reservist[j].name)

          if(player.position === "G"){
            player["pool_points"] = this.state.pool_info.goalies_pts_wins*player.stats.wins + this.state.pool_info.goalies_pts_shutouts*player.stats.shutouts
            stats[pooler]["reservists_total_pts"] += this.state.pool_info.goalies_pts_wins*player.stats.wins + this.state.pool_info.goalies_pts_shutouts*player.stats.shutouts
          }
          else if(player.position === "F"){
            player["pool_points"] = this.state.pool_info.forward_pts_goals*player.stats.goals + this.state.pool_info.forward_pts_assists*player.stats.assists //+ hat trick 
            stats[pooler]["reservists_total_pts"] += this.state.pool_info.forward_pts_goals*player.stats.goals + this.state.pool_info.forward_pts_assists*player.stats.assists //+ hat trick 
          }
          else{
            player["pool_points"] = this.state.pool_info.defender_pts_goals*player.stats.goals + this.state.pool_info.defender_pts_assits*player.stats.assists //+ hat trick
            stats[pooler]["reservists_total_pts"] +=  this.state.pool_info.defender_pts_goals*player.stats.goals + this.state.pool_info.defender_pts_assits*player.stats.assists //+ hat trick
          }
          stats[pooler]["chosen_reservist"].push(player)
        }

        stats[pooler]["total_pts"] = stats[pooler]["forwards_total_pts"] + stats[pooler]["defenders_total_pts"] + stats[pooler]["goalies_total_pts"] + stats[pooler]["reservists_total_pts"]
        // TODO, calculate points for each poolers using pool parameters entered when creating the pool

        var pooler_global_stats = {
          name: pooler, 
          defenders_total_pts: stats[pooler]["defenders_total_pts"],
          forwards_total_pts: stats[pooler]["forwards_total_pts"],
          goalies_total_pts: stats[pooler]["goalies_total_pts"],
          reservists_total_pts: stats[pooler]["reservists_total_pts"],
          total_pts: stats[pooler]["total_pts"]
        }

        ranking.push(pooler_global_stats)
      }
      await this.sort_by_stats("total_pts", ranking)
      this.setState({ranking: ranking})
      this.setState({player_stats: stats})
    }

    async download_csv(pool){
      var csv = 'Player Name,Team\n';

      for(var i = 0; i < pool.number_poolers; i++){
        var pooler = pool.participants[i]
        
        // forward
        csv += pooler + "'s forwards\n"
        for(var j= 0; j < pool.context[pooler].chosen_forward.length; j++){
          csv += pool.context[pooler].chosen_forward[j].name + ', ' + pool.context[pooler].chosen_forward[j].team
          csv += "\n";
        }
        csv += "\n";

        // defenders
        csv += pooler + "'s defenders\n"
        for(var j= 0; j < pool.context[pooler].chosen_defender.length; j++){
          csv += pool.context[pooler].chosen_defender[j].name + ', ' + pool.context[pooler].chosen_defender[j].team
          csv += "\n";
        }
        csv += "\n";

        // goalies
        csv += pooler + "'s goalies\n"
        for(var j= 0; j < pool.context[pooler].chosen_goalies.length; j++){
          csv += pool.context[pooler].chosen_goalies[j].name + ', ' + pool.context[pooler].chosen_goalies[j].team
          csv += "\n";
        }
        csv += "\n";

        // reservist
        csv += pooler + "'s reservists\n"
        for(var j= 0; j < pool.context[pooler].chosen_reservist.length; j++){
          csv += pool.context[pooler].chosen_reservist[j].name + ', ' + pool.context[pooler].chosen_reservist[j].team
          csv += "\n";
        }
        csv += "\n";
        csv += "\n-------, -------, -------, -------\n";
        csv += "\n";
      }

      console.log(csv);
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'people.csv';
      hiddenElement.click();

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

      this.filter_players()
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
      else if(stats === "pts"){
        array.sort(function(a, b) {
          return b.stats.pts - a.stats.pts;
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
      else if(stats === "total_pts"){
        array.sort(function(a, b) {
          return b.total_pts - a.total_pts;
        });
      }
      else if(stats === "name"){
        array.sort(function(a, b) {
          if(a.name < b.name) {return -1;}
          if(a.name > b.name) {return 1;}
          return 0;
        });
      }
      else if(stats === "team"){
        array.sort(function(a, b) {
          if(a.team < b.team) {return -1;}
          if(a.team > b.team) {return 1;}
          return 0;
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
      if(event.target.type === "checkbox"){
        if(event.target.checked){
          socket.emit('playerReady', Cookies.get('token'), this.state.pool_info.name);
        }
        else{
          socket.emit('playerNotReady', Cookies.get('token'), this.state.pool_info.name);
        }
      }

      else if(event.target.type === "submit"){
        socket.emit('startDraft', Cookies.get('token'), this.state.pool_info.name);
      }
      
    }

    async filter_players(){

      if(this.state.pool_info.status === "draft"){
        var def_picked_l = []
        var forward_picked_l = []
        var goalies_picked_l = []
  
        var participant
  
        var filtered_def_l = []
        var filtered_forward_l = []
        var filtered_goalies_l = []
  
  
        for(var i = 0; i < this.state.pool_info.participants.length; i++){
          participant = this.state.pool_info.participants[i]
          
          def_picked_l = def_picked_l.concat(this.state.pool_info.context[participant].chosen_defender)
          forward_picked_l = forward_picked_l.concat(this.state.pool_info.context[participant].chosen_forward)
          goalies_picked_l = goalies_picked_l.concat(this.state.pool_info.context[participant].chosen_goalies)

          def_picked_l = def_picked_l.concat(this.state.pool_info.context[participant].chosen_reservist)
          forward_picked_l = forward_picked_l.concat(this.state.pool_info.context[participant].chosen_reservist)
          goalies_picked_l = goalies_picked_l.concat(this.state.pool_info.context[participant].chosen_reservist)
        }
        
        filtered_def_l = await this.filterArray(this.state.def_l, def_picked_l)
        filtered_forward_l = await this.filterArray(this.state.forw_l, forward_picked_l)
        filtered_goalies_l = await this.filterArray(this.state.goal_l, goalies_picked_l)
  
        this.setState({def_l: filtered_def_l})
        this.setState({forw_l: filtered_forward_l})
        this.setState({goal_l: filtered_goalies_l})
      }

    }

    async filter_protected_players(){
      if(this.state.pool_info.status === "dynastie"){
        var forw_filtered = []

        forw_filtered = await this.filterArray(this.state.pool_info['context'][this.state.username]['chosen_forward'], this.state.forw_protected)
        forw_filtered = await this.filterArray(forw_filtered, this.state.reserv_protected)

        this.setState({not_protected_forwards: forw_filtered})

        var def_filtered = []

        def_filtered = await this.filterArray(this.state.pool_info['context'][this.state.username]['chosen_defender'], this.state.def_protected)
        def_filtered = await this.filterArray(def_filtered, this.state.reserv_protected)
        this.setState({not_protected_defenders: def_filtered})

        var goal_filtered = []

        goal_filtered = await this.filterArray(this.state.pool_info['context'][this.state.username]['chosen_goalies'], this.state.goal_protected)
        goal_filtered = await this.filterArray(goal_filtered, this.state.reserv_protected)
        this.setState({not_protected_goalies: goal_filtered})

        var reserv_filtered = []

        reserv_filtered = await this.filterArray(this.state.pool_info['context'][this.state.username]['chosen_reservist'], this.state.forw_protected)
        reserv_filtered = await this.filterArray(reserv_filtered, this.state.def_protected)
        reserv_filtered = await this.filterArray(reserv_filtered, this.state.goal_protected)
        reserv_filtered = await this.filterArray(reserv_filtered, this.state.reserv_protected)
        this.setState({not_protected_reservists: reserv_filtered})
      }
    }

    async protect_player(player){
      var changedArray = []
      var number_protected = this.state.def_protected.length + this.state.forw_protected.length + this.state.goal_protected.length

      var add_to_reservist = false

      if(number_protected < this.state.pool_info.next_season_number_players_protected){
        if(player.role === "D"){
          if(this.state.def_protected.length < this.state.pool_info.number_defenders){
            changedArray = this.state.def_protected
            changedArray.push(player)

            this.setState({def_protected: changedArray})
          }
          else{
            add_to_reservist = true
          }
 
        }
        else if(player.role === "F"){
          if(this.state.forw_protected.length < this.state.pool_info.number_forward){
            changedArray = this.state.forw_protected
            changedArray.push(player)
    
            this.setState({forw_protected: changedArray})
          }
          else{
            add_to_reservist = true
          }
          
        }
        else if(player.role === "G"){
          if(this.state.goal_protected.length < this.state.pool_info.number_goalies){
            changedArray = this.state.goal_protected
            changedArray.push(player)
    
            this.setState({goal_protected: changedArray})
          }
          else{
            add_to_reservist = true
          }
        }
      }
      else{
        console.log("Maximum player protected reach")
      }

      if(add_to_reservist){
        if(this.state.reserv_protected.length < this.state.pool_info.number_reservist){
          changedArray = this.state.reserv_protected
          changedArray.push(player)
  
          this.setState({reserv_protected: changedArray})
        }
        else{
          console.log("No more place in reservist")
        }
      }
      this.filter_protected_players()
    }

    async unprotect_player(player, isReservist){
      if((this.state.def_protected.length + this.state.forw_protected.length + this.state.goal_protected.length + this.state.reserv_protected.length) > 0)
      {
        var changedArray = []
        var protected_player_array = []

        if(player.role === "D"){
          if(!isReservist){
            protected_player_array = this.state.def_protected
            var index = protected_player_array.indexOf(player)
            if(index > -1){
              protected_player_array.splice(index, 1)
            }
            this.setState({def_protected: protected_player_array})
          }
        }
        else if(player.role === "F"){
          if(!isReservist){
            protected_player_array = this.state.forw_protected
            var index = protected_player_array.indexOf(player)
            if(index > -1){
              protected_player_array.splice(index, 1)
            }
            this.setState({forw_protected: protected_player_array})
          }
        }
        else if(player.role === "G"){
          if(!isReservist){
            protected_player_array = this.state.goal_protected
            var index = protected_player_array.indexOf(player)
            if(index > -1){
              protected_player_array.splice(index, 1)
            }
            this.setState({goal_protected: protected_player_array})
          }
        }
        else{
          console.log("invalid player selection")
        }

        // remove from reservist protected player
        if(isReservist){
          protected_player_array = this.state.reserv_protected
          var index = protected_player_array.indexOf(player)
          if(index > -1){
            protected_player_array.splice(index, 1)
          }
          this.setState({reserv_protected: protected_player_array})
        }
      }
      else{
        console.log("You dont have any protected players")
      }
      this.filter_protected_players()
    }

    async send_protected_player(){
      
      var number_protected_player = this.state.def_protected.length + this.state.forw_protected.length + this.state.goal_protected.length + this.state.reserv_protected.length

      if(number_protected_player === this.state.pool_info.next_season_number_players_protected){
        //TODO: send the list of protected players to server and store it in data base
        console.log("send it to server to store the information")

        var cookie = Cookies.get('token')

        // validate login
        const requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'token': cookie},
          body: JSON.stringify({'pool_name': this.state.pool_info.name, 'def_protected': this.state.def_protected, 'forw_protected': this.state.forw_protected, 'goal_protected': this.state.goal_protected, 'reserv_protected': this.state.reserv_protected})
        };
        fetch('../pool/protect_players', requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data.success === "False"){
                this.props.history.push('/login');
            }
            else{
              console.log('successfuly saved your protected players')
              this.componentDidMount()
            }
        })


      }
      else{
        console.log('You need to protect ' + this.state.pool_info.next_season_number_players_protected + ' players')
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
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_defender_stats = (pooler) => {
        if(this.state.player_stats[pooler]){
         
          return (
          <>
          {this.state.player_stats[pooler]['chosen_defender'].map((player, index) =>
          <tr>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
            <td>{player.stats.goals}</td>
            <td>{player.stats.assists}</td>
            <td>{player.stats.pts}</td>
            <td>{player.pool_points}</td>
          </tr> 
          )}
          <tr>
            <th>total</th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th>{this.state.player_stats[pooler]['defenders_total_pts']}</th>
          </tr>
          </>
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
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_forward_stats = (pooler) => {
        if(this.state.player_stats[pooler]){
          
          return( 
          <>
          {this.state.player_stats[pooler]['chosen_forward'].map((player, index) =>
          <tr class="content-table">
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
            <td>{player.stats.goals}</td>
            <td>{player.stats.assists}</td>
            <td>{player.stats.pts}</td>
            <td>{player.pool_points}</td>
          </tr>
        )
        }
          <tr>
            <th>total</th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th>{this.state.player_stats[pooler]['forwards_total_pts']}</th>
          </tr>
        </>
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
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_reservist_stats = (pooler) => {
        if(this.state.player_stats[pooler]){
          
          return (
            <>
            
            {this.state.player_stats[pooler]['chosen_reservist'].map((player, index) =>
          <tr>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
            <td>{player.stats.goals}</td>
            <td>{player.stats.assists}</td>
            <td>{player.stats.pts}</td>
            <td>{player.pool_points}</td>
          </tr>
        )}
        <tr>
            <th>total</th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th>{this.state.player_stats[pooler]['reservists_total_pts']}</th>
          </tr>
        </>

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
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_goalies_stats = (pooler) => {
        if(this.state.player_stats[pooler]){
          
          return (
            <>
            {this.state.player_stats[pooler]['chosen_goalies'].map((player, index) =>
          <tr>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
            <td>{player.stats.wins}</td>
            <td>{player.stats.losses}</td>
            <td>{player.stats.shutouts}</td>
            <td>{player.stats.savePercentage}</td>
            <td>{player.pool_points}</td>

          </tr>
        )
          }
          <tr>
            <th>total</th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th> - </th>
            <th>{this.state.player_stats[pooler]['goalies_total_pts']}</th>
          </tr>
          </>
          )

        }

        else{
          return
        }
      }

      const isUser = (participant) => {
        return participant === this.state.username
      }

      const render_forward_dynastie = () => {
        if(this.state.not_protected_forwards){
          console.log("HERE: " + this.state.not_protected_forwards)

          return this.state.not_protected_forwards.map((player, index) =>
          <tbody>
            <tr onClick={() => this.protect_player(player)}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
            </tr>
          </tbody>
        )
        }
        else{
          return
        }
      }

      const render_defender_dynastie = () => {
        if(this.state.not_protected_defenders){

          return this.state.not_protected_defenders.map((player, index) =>
          <tr onClick={() => this.protect_player(player)}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_goalies_dynastie = () => {
        if(this.state.not_protected_goalies){

          return this.state.not_protected_goalies.map((player, index) =>
          <tr onClick={() => this.protect_player(player)}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_reservist_dynastie = () => {
        if(this.state.not_protected_reservists){
        
          return this.state.not_protected_reservists.map((player, index) =>
          <tr onClick={() => this.protect_player(player)}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            <td>
              <img src={logos[player.team]} width="30" height="30"></img>
            </td>
          </tr>
        )
        }
        else{
          return
        }
      }

      const render_tabs_choice = () => {
        if(this.state.pool_info['participants']){
          var array = this.state.pool_info['participants']

          // replace pooler user name to be first
          var index = array.findIndex(isUser)
          array.splice(index, 1)
          array.splice(0, 0, this.state.username)

          return <Tabs>
                  {array.map(pooler =>
                      <div label={pooler}>
                        <table class="content-table">
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

      const render_tabs_choice_stats = () => {
        if(this.state.pool_info['participants']){
          var array = this.state.pool_info['participants']

          // replace pooler user name to be first
          var index = array.findIndex(isUser)
          array.splice(index, 1)
          array.splice(0, 0, this.state.username)

          return <Tabs>
                  {array.map(pooler =>
                      <div label={pooler} >
                        <Tabs>
                        <div label="Forward">
                      <table class="content-table">
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                      <th>Goal</th>
                      <th>Assist</th>
                      <th>Pts</th>
                      <th>Pts (pool)</th>
                    </tr>
                    {render_forward_stats(pooler)}
                    </table>
                    </div>
                    <div label="Defenders">
                    <table class="content-table">
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                      <th>Goal</th>
                      <th>Assist</th>
                      <th>Pts</th>
                      <th>Pts (pool)</th>
                    </tr>
                    {render_defender_stats(pooler)}
                    </table>
                    </div>
                    <div label="Goalies">
                    <table class="content-table">
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                      <th>Win</th>
                      <th>Loss</th>
                      <th>Shutout</th>
                      <th>Save %</th>
                      <th>Pts (pool)</th>
                    </tr>
                    {render_goalies_stats(pooler)}
                    </table>
                    </div>
                    <div label="Reservists">
                    <table class="content-table">
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>

                    </tr>
                    {render_reservist_stats(pooler)}
                    </table>
                    </div>
                  
                  </Tabs>
                      </div>
                  )}
          </Tabs>
          
        }
        else{
          return
        }
      }

      const render_tabs_pool_rank = () => {
        if(this.state.ranking){
          return(
          this.state.ranking.map((pooler_stats, index) =>
          <tr>
            <td>{index + 1}</td>
            <td>{pooler_stats.name}</td>
            <td>{pooler_stats.forwards_total_pts}</td>
            <td>{pooler_stats.defenders_total_pts}</td>
            <td>{pooler_stats.goalies_total_pts}</td>
            <td>{pooler_stats.reservists_total_pts}</td>
            <td>{pooler_stats.total_pts}</td>
          </tr>
          )
          
          )
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
            <div label="defenders">
            <table class="content-table">
              <tbody>
              <tr>
                <th onClick={() => this.sort_by_number("name", "D")}>name</th>
                <th onClick={() => this.sort_by_number("team", "D")}>team</th>
                <th onClick={() => this.sort_by_number("games", "D")}>Games played</th>
                <th onClick={() => this.sort_by_number("goals", "D")}>Goals</th>
                <th onClick={() => this.sort_by_number("assists", "D")}>Assists</th>
                <th onClick={() => this.sort_by_number("pts", "D")}>pts</th>
              </tr>
              {this.state.def_l.map(player => 
                <tr onClick={() => this.player_selection(player.name, player.team, "D")}>
                  <td>{player.name}</td>
                  <td>
                    <img src={logos[player.team]} width="30" height="30"></img>
                  </td>
                  <td>{player.stats.games}</td>
                  <td>{player.stats.goals}</td>
                  <td>{player.stats.assists}</td>
                  <td>{player.stats.pts}</td>
                </tr>
                )}
                </tbody>
            </table>
            </div>
            <div label="forwards">
              <table class="content-table">
                <tbody>
                <tr>
                  <th onClick={() => this.sort_by_number("name", "F")}>name</th>
                  <th onClick={() => this.sort_by_number("team", "F")}>team</th>
                  <th onClick={() => this.sort_by_number("games", "F")}>Games played</th>
                  <th onClick={() => this.sort_by_number("goals", "F")}>Goals</th>
                  <th onClick={() => this.sort_by_number("assists", "F")}>Assists</th>
                  <th onClick={() => this.sort_by_number("pts", "F")}>pts</th>
                </tr>
                {this.state.forw_l.map(player => 
                  <tr onClick={() => this.player_selection(player.name, player.team, "F")}>
                    <td>{player.name}</td>
                    <td>
                      <img src={logos[player.team]} width="30" height="30"></img>
                    </td>
                    <td>{player.stats.games}</td>
                    <td>{player.stats.goals}</td>
                    <td>{player.stats.assists}</td>
                    <td>{player.stats.pts}</td>
                  </tr>
                  )}
                  </tbody>
              </table>
            </div> 
            <div label="goalies">
              <table class="content-table">
                <tbody>
                <tr>
                  <th onClick={() => this.sort_by_number("name", "G")}>name</th>
                  <th onClick={() => this.sort_by_number("team", "G")}>team</th>
                  <th onClick={() => this.sort_by_number("games", "G")}>Games played</th>
                  <th onClick={() => this.sort_by_number("wins", "G")}>Win</th>
                  <th onClick={() => this.sort_by_number("losses", "G")}>losses</th>
                  <th onClick={() => this.sort_by_number("savePercentage", "G")}>save percentage</th>
                </tr>
                {this.state.goal_l.map(player => 
                  <tr onClick={() => this.player_selection(player.name, player.team, "G")}>
                    <td>{player.name}</td>
                    <td>
                      <img src={logos[player.team]} width="30" height="30"></img>
                    </td>
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
                  <table class="content-table">
                    <tbody>
                    <tr>
                      <th onClick={() => this.sort_by_number("name", "N/A")}>name</th>
                      <th onClick={() => this.sort_by_number("team", "N/A")}>logo</th>
                      <th onClick={() => this.sort_by_number("games", "N/A")}>Games played</th>
                      <th onClick={() => this.sort_by_number("goals", "N/A")}>Goals</th>
                      <th onClick={() => this.sort_by_number("assists", "N/A")}>Assists</th>
                      <th onClick={() => this.sort_by_number("pts", "N/A")}>pts</th>
                    </tr>
                    {this.state.na_l.map(player => 
                      <tr onClick={() => this.player_selection(player.name, player.team, "G")}>
                        <td>{player.name}</td>
                        <td>
                          <img src={logos[player.team]} width="30" height="30"></img>
                        </td>
                        <td>{player.stats.games}</td>
                        <td>{player.stats.goals}</td>
                        <td>{player.stats.assists}</td>
                        <td>{player.stats.pts}</td>
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
      else if (this.state.pool_info.status === "dynastie"){
        var nb_player = this.state.pool_info.context[this.state.username].nb_defender + this.state.pool_info.context[this.state.username].nb_forward + this.state.pool_info.context[this.state.username].nb_goalies + this.state.pool_info.context[this.state.username].nb_reservist
        if(nb_player > this.state.pool_info.next_season_number_players_protected ){

        
        return(
          <div>
            <h1>Protect player for pool: {this.state.pool_info.name}</h1>
            <div class="container">
              <div class="floatLeft">
                <h2>Protect {this.state.pool_info.next_season_number_players_protected} players of your team</h2>
                <table border="1">
                  <thead>
                    <h3>Forwards</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  {render_forward_dynastie()}
                  <thead>
                    <h3>Defenders</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_defender_dynastie()}
                  </thead>
                  <thead>
                    <h3>Goalies</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_goalies_dynastie()}
                  </thead>
                  <thead>
                    <h3>Reservists</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                    {render_reservist_dynastie()}
                  </thead>
                </table>
              </div>
              <div class="floatRight">
                <h2>Protected players</h2>
                <table border="1">
                  <thead>
                    <h3>Forwards</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  {this.state.forw_protected.map((player, index) => //TODO: when clicked on remove from protected player list
                    <tr onClick={() => this.unprotect_player(player, false)}>
                      <td>{index + 1}</td>
                      <td>{player.name}</td>
                      <td>
                        <img src={logos[player.team]} width="30" height="30"></img>
                      </td>
                    </tr>
                  )}
                  <thead>
                    <h3>Defenders</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  {this.state.def_protected.map((player, index) => //TODO: when clicked on remove from protected player list
                    <tr onClick={() => this.unprotect_player(player, false)}>
                      <td>{index + 1}</td>
                      <td>{player.name}</td>
                      <td>
                        <img src={logos[player.team]} width="30" height="30"></img>
                      </td>
                    </tr>
                  )}
                  <thead>
                    <h3>Goalies</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  {this.state.goal_protected.map((player, index) => //TODO: when clicked on remove from protected player list
                    <tr onClick={() => this.unprotect_player(player, false)}>
                      <td>{index + 1}</td>
                      <td>{player.name}</td>
                      <td>
                        <img src={logos[player.team]} width="30" height="30"></img>
                      </td>
                    </tr>
                  )}
                  <thead>
                    <h3>Reservist</h3>
                    <tr>
                      <th>#</th>
                      <th>name</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  {this.state.reserv_protected.map((player, index) => //TODO: when clicked on remove from protected player list
                    <tr onClick={() => this.unprotect_player(player, true)}>
                      <td>{index + 1}</td>
                      <td>{player.name}</td>
                      <td>
                        <img src={logos[player.team]} width="30" height="30"></img>
                      </td>
                    </tr>
                  )}
                  </table>
                  <button onClick={() => this.send_protected_player()}>
                    completed protecting player
                  </button>
              </div>
            </div>
          </div>
        )
        }
        else{
          return(
            <div>
              <h1>Waiting for other player to protect their player...</h1>
            </div>
          )
        }
      }
      else if (this.state.pool_info.status === "in Progress"){
        return(
          <div class="back-site">
            <h1>Pool in progress...</h1>
            
            <div class="floatLeft">
              <div>
                    {render_tabs_choice_stats()}
              </div>
            </div>
            <div class="floatRight">
              <h1>Today's ranking</h1>
              <table class="content-table">
                <tr>
                  <th>rank</th>
                  <th>pooler name</th>
                  <th>forwards (pts)</th>
                  <th>defenders (pts)</th>
                  <th>goalies (pts)</th>
                  <th>reservists (pts)</th>
                  <th>total (pts)</th>
                </tr>
              {render_tabs_pool_rank()}
              </table>
            </div>
            <button onClick={() => this.download_csv(this.state.pool_info)}>Download CSV</button>
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