import React, { Component } from 'react';
import Cookies from 'js-cookie';

export default class CreatePool extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            pool_name: "",
            number_poolers: 4,
            number_forward: 9,
            number_defenders: 4,
            number_goalies: 2,
            number_reservist: 2,
            next_season_number_players_protected: 8,
            tradable_picks: 3,


            forward_pts_goals: 2,
            forward_pts_assists: 1,
            forward_pts_hattricks: 3,
            defender_pts_goals: 3,
            defender_pts_assits: 2,
            defender_pts_hattricks: 3,
            goalies_pts_wins: 2,
            goalies_pts_shutouts: 3,
            goalies_pts_goals: 3,
            goalies_pts_assists: 2,

            
        }
        this.handleChange = this.handleChange.bind(this);
    };

    async componentDidMount() {
      const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token')}
      };
      fetch('auth/get_user', requestOptions)
      .then(response => response.json())
      .then(data => {
          if(data.success === "False"){
              this.props.history.push('/Login');
          }
          else{
            this.setState({username: data.username})
          }
      })
    }

    async create_pool(){
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token')},
        body: JSON.stringify({ name: this.state.pool_name,
                                owner: this.state.username,
                                number_poolers: this.state.number_poolers,
                                number_forward: this.state.number_forward,
                                number_defenders: this.state.number_defenders,
                                number_goalies: this.state.number_goalies,
                                number_reservist: this.state.number_reservist,
                                forward_pts_goals: this.state.forward_pts_goals,
                                forward_pts_assists: this.state.forward_pts_assists,
                                forward_pts_hattricks: this.state.forward_pts_hattricks,
                                defender_pts_goals: this.state.defender_pts_goals,
                                defender_pts_assits: this.state.defender_pts_assits,
                                defender_pts_hattricks: this.state.defender_pts_hattricks,
                                goalies_pts_wins: this.state.goalies_pts_wins,
                                goalies_pts_shutouts: this.state.goalies_pts_shutouts,
                                goalies_pts_goals: this.state.goalies_pts_goals,
                                goalies_pts_assists: this.state.goalies_pts_assists,
                                next_season_number_players_protected: this.state.next_season_number_players_protected,
                                tradable_picks: this.state.tradable_picks
                            })
    };
    fetch('pool/pool_creation', requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data.success === "True"){

                //this.props.history.push('/pool_list'); TODO: Enter pool entrance with other user
                console.log(data.message)
            }
            else{
                console.log(data.message)
            }
        });
    }
    
    handleChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;

        this.setState({[name]: value});
        console.log(name + " : " + value);
    }

    render() {
      return(
        <div>
            <h1>create pool</h1>
            <p>Pool name:</p>
            <input type="text" placeholder="pool name" name="pool_name" onChange={this.handleChange} required/>
            <p>Number of poolers:</p>
            <select 
              name="number_poolers" 
              onChange={this.handleChange} 
            >
              <option>2</option>
              <option>3</option>
              <option selected>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
              <option >12</option>
            </select>
            <p>Number of forwards:</p>
            <select 
              name="number_forward" 
              onChange={this.handleChange} 
            >
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option selected>9</option>
              <option>10</option>
              <option>11</option>
              <option>12</option>
            </select>
            <p>Number of defenders:</p>
            <select 
              name="number_defenders" 
              onChange={this.handleChange} 
            >
              <option>2</option>
              <option>3</option>
              <option selected>4</option>
              <option>5</option>
              <option>6</option>
            </select>
            <p>Number of goalies:</p>
            <select 
              name="number_goalies" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option selected>2</option>
              <option>3</option>
            </select>
            <p>Number of reservists:</p>
            <select 
              name="number_reservist" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option selected>2</option>
              <option>3</option>
              <option>4</option>
            </select>

            <p>pts per goal by forward:</p>
            <select 
              name="forward_pts_goals" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option selected>2</option>
              <option>3</option>
            </select>
            <p>pts per assist by forward:</p>
            <select 
              name="forward_pts_assists" 
              onChange={this.handleChange} 
            >
              <option selected>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p>pts per hat trick by forward:</p>
            <select 
              name="forward_pts_hattricks" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option selected>3</option>
            </select>
            <p>pts per goal by defender:</p>
            <select 
              name="defender_pts_goals" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option selected>3</option>
            </select>
            <p>pts per assist by defender:</p>
            <select 
              name="defender_pts_assits" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option selected>2</option>
              <option>3</option>
            </select>
            <p>pts per hat trick by defender:</p>
            <select 
              name="defender_pts_hattricks" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option selected>3</option>
            </select>
            <p>pts per win by goalies</p>
            <select 
              name="goalies_pts_wins" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option selected>2</option>
              <option>3</option>
            </select>
            <p>pts per shutout by goalies</p>
            <select 
              name="goalies_pts_shutouts" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option selected>3</option>
            </select>
            <p>pts per goal by goalies:</p>
            <select 
              name="goalies_pts_goals" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option selected>3</option>
            </select>
            <p>pts per assist by goalies:</p>
            <select 
              name="goalies_pts_assists" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option selected>2</option>
              <option>3</option>
            </select>
            <p>next season number player protected:</p>
            <select 
              name="next_season_number_players_protected" 
              onChange={this.handleChange} 
            >
              <option>6</option>
              <option>7</option>
              <option selected>8</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
              <option>12</option>
            </select>
            <p>number tradable draft picks:</p>
            <select 
              name="tradable_picks" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option selected>3</option>
              <option>4</option>
              <option>5</option>
            </select>

            <button onClick={() => this.create_pool()} >Create pool</button>
            
        </div>
     );
    }
  
  }