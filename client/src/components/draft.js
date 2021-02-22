import React, { Component } from 'react';
import './draft.css';
import Tabs from "./Tabs"

// TODO, parameters received from game creation settings
const MAX_FORWARD = 12;
const MAX_DEFENSE = 6;
const MAX_GOALTENDER = 2;
const MAX_RESERVIST = 4;

export default class Draft extends Component {
  constructor(props) {
    super(props);
    // variable from this page
		this.state = {
      def_l: [],
      forw_l: [],
      goal_l: [],
      na_l: [],

      selected_player: {name: "select a player", team: " - ", role: " - "},

      chosen_forward: Array(MAX_FORWARD).fill({name: " - ", team: " - "}),
      chosen_defender: Array(MAX_DEFENSE).fill({name: " - ", team: " - "}),
      chosen_goalies: Array(MAX_GOALTENDER).fill({name: " - ", team: " - "}),
      chosen_reservist: Array(MAX_RESERVIST).fill({name: " - ", team: " - "}),

      number_forward_chosen: 0,
      number_defender_chosen: 0,
      number_goalies_chosen: 0,
      number_reservist_chosen: 0,

		}};

  async componentDidMount() {
    
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
    // TODO: validate if its user turn

    // defense
    if(player.role === "D"){
      var chosen_defender = this.state.chosen_defender
      var number_defender_chosen = this.state.number_defender_chosen

      if (number_defender_chosen < MAX_DEFENSE){
        chosen_defender[number_defender_chosen] = player
        number_defender_chosen += 1

        this.setState({chosen_defender: chosen_defender, number_defender_chosen: number_defender_chosen})
      }
      else{
        console.log("already maximum defenders")
      }

    }
    // forward
    else if(player.role === "F"){
      var chosen_forward = this.state.chosen_forward
      var number_forward_chosen = this.state.number_forward_chosen

      if (number_forward_chosen < MAX_FORWARD){
        chosen_forward[number_forward_chosen] = player
        number_forward_chosen += 1

        this.setState({chosen_forward: chosen_forward, number_forward_chosen: number_forward_chosen})
      }
      else{
        console.log("already maximum forward")
      }
    }
    // goaltender
    else if(player.role === "G"){
      var chosen_goalies = this.state.chosen_goalies
      var number_goalies_chosen = this.state.number_goalies_chosen

      if (number_goalies_chosen < MAX_GOALTENDER){
        chosen_goalies[number_goalies_chosen] = player
        number_goalies_chosen += 1

        this.setState({chosen_goalies: chosen_goalies, number_goalies_chosen: number_goalies_chosen})
      }
      else{
        console.log("already maximum goalies")
      }
    }
    // not a valid player
    else{
      console.log("")
    }
    
  }

  render() {
    return(
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
                {this.state.chosen_forward.map((player, index) =>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>{player.team}</td>
                  </tr>
                )}
                <h3>Def</h3>
                <tr>
                  <th>#</th>
                  <th>name</th>
                  <th>team</th>
                </tr>
                {this.state.chosen_defender.map((player, index) =>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>{player.team}</td>
                  </tr>
                )}
                <h3>Goalies</h3>
                <tr>
                  <th>#</th>
                  <th>name</th>
                  <th>team</th>
                </tr>
                {this.state.chosen_goalies.map((player, index) =>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>{player.team}</td>
                  </tr>
                )}
                <h3>Reservist</h3>
                <tr>
                  <th>#</th>
                  <th>name</th>
                  <th>team</th>
                </tr>
                {this.state.chosen_reservist.map((player, index) =>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>{player.team}</td>
                  </tr>
                )}
                
                
              </table>
            </div>
          </div>
        </div>  
   );
  }

}