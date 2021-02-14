import React, { Component } from 'react';
import Cookies from 'js-cookie';
import io from "socket.io-client";
const socket = io("http://localhost:8080")

export default class PoolMatchMaking extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            pool_info: {}
        }
        this.handleChange = this.handleChange.bind(this);
    };
        
  
    async componentDidMount() {

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
            this.setState({username: data.username})
          }
      })
      var pool_name = this.props.match.params.name

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
    
    handleChange(event) {
        const target = event.target;
        const name = target.name;

        this.setState({[name]: target.value});
    }
  
    render() {
      return(
        <div>
          <h1>Match Making for Pool {this.state.pool_info.name}</h1>
          <h2>Rule: </h2>
        </div>

      )
    
    }
}