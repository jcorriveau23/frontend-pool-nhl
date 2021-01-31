import React, { Component } from 'react';

export default class CreatePool extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            number_poolers: 2,
            forward_pts_goals: 1,
            forward_pts_assists: 1,
            forward_pts_hattricks: 1,
            defender_pts_goals: 1,
            defender_pts_assits: 1,
            defender_pts_hattricks: 1,
            goalies_pts_wins: 1,
            goalies_pts_shutouts: 1,
            goalies_pts_goals: 1,
            goalies_pts_assists: 1
        }
        this.handleChange = this.handleChange.bind(this);
    };

    async componentDidMount() {
      //TODO get username
    }

    async create_pool(){
        // TODO create pool object with state variable and store it in db as a pool object
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
            <h1>create pool (TODO)</h1>
            <p>Pool name:</p>
            <input type="text" placeholder="pool name" name="pool_name" onChange={this.handleChange} required/>
            <p>Number of poolers:</p>
            <select 
              name="number_poolers" 
              onChange={this.handleChange} 
            >
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
              <option>12</option>
            </select>
            <p>pts per goal by forward:</p>
            <select 
              name="forward_pts_goals" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p>pts per assist by forward:</p>
            <select 
              name="forward_pts_assists" 
              onChange={this.handleChange} 
            >
              <option>1</option>
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
              <option>3</option>
            </select>
            <p>pts per goal by defender:</p>
            <select 
              name="defender_pts_goals" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p>pts per assist by defender:</p>
            <select 
              name="defender_pts_assits" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p>pts per hat trick by defender:</p>
            <select 
              name="defender_pts_hattricks" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p>pts per win by goalies</p>
            <select 
              name="goalies_pts_wins" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p>pts per shutout by goalies</p>
            <select 
              name="goalies_pts_shutouts" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p>pts per goal by goalies:</p>
            <select 
              name="goalies_pts_goals" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <p>pts per assist by goalies:</p>
            <select 
              name="goalies_pts_assists" 
              onChange={this.handleChange} 
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
            <button onClick={() => this.create_pool()} >Create pool</button>
            
        </div>
     );
    }
  
  }