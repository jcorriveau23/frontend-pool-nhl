import React, { Component } from 'react';
import Cookies from 'js-cookie';
import io from "socket.io-client";

import './poolMatchMaking.css';

const socket = io("http://localhost:8080")


function get_username2(){
  // validate login
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token')}
  };
  fetch('http://localhost:3000/auth/get_user', requestOptions)
  .then(response => response.json())
  .then(data => {
      if(data.success === "False"){
          this.props.history.push('/login');
      }
      else{
        console.log(data.username)
        return data.username
      }
  })
}

export default class PoolMatchMaking extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            pool_info: {},
            pool_name: "",
            user_list: []
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

    }
    async componentCleanup(){
      console.log("leaving pool: " + this.state.pool_name)
      socket.emit('leaveRoom', Cookies.get('token'), this.state.pool_name);
      socket.off('roomData');
    }
    async componentDidMount() {

      var pool_name = await this.props.match.params.name
      this.setState({pool_name: pool_name})      

      // get pool info
      const requestOptions2 = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token'), 'pool_name': pool_name}
      };
      fetch('http://localhost:3000/pool/get_pool_info', requestOptions2)
      .then(response => response.json())
      .then(data => {
          if(data.success === "False"){
              this.props.history.push('/pool_list');
          }
          else{
            console.log(data.message)
            this.setState({pool_info: data.message})
          }
          
      })
      // update new pool participant
      const requestOptions3 = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token'), 'pool_name': pool_name}
      };
      fetch('http://localhost:3000/pool/new_participant', requestOptions3)
      .then(response => response.json())
      .then(data => {
          if(data.success === "False"){
            if(data.message.includes("Already participating in pool")){
            }
            else{
              this.props.history.push('/pool_list');
            }
          }
          else{
            console.log(data.message)
          }  
      })
      

    }
    
    async componentWillUnmount(){
      this.componentCleanup();
      window.removeEventListener('beforeunload', this.componentCleanup); // remove the event handler for normal unmounting
    }

    handleChange(event) {
        const target = event.target;
        const name = target.name;

        this.setState({[name]: target.value});
    }
  
    render() {
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
            <h2>Participants: </h2>
            {this.state.user_list.map(user =>
            <li>{user}</li>
            )}
          </div>
        </div>

      )
    
    }
}