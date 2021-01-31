// {"name": "Jean-Francois Corriveau", "password": "molly915"}
import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';

export default class Login extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            psw: "",
            msg: ""
        }
        this.handleChange = this.handleChange.bind(this);
    };
        

    
  
    async componentDidMount() {
      //TODO
    }

    async login(){

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.state.username, password: this.state.psw})
        };
        fetch('http://localhost:3000/auth/login', requestOptions)
            .then(response => response.json())
            .then(data => {
                if(data.success === "True"){
                    this.setState({msg: data.message})
                    this.props.history.push('/pool_list');
                    //TODO use token for the user next login
                }
                else{
                    this.setState({msg: data.error})
                }
            });

        }
    
    handleChange(event) {
        const target = event.target;
        const name = target.name;

        this.setState({[name]: target.value});
    }
  
    render() {
      return(
        <div>
            <form>
                <h1>Login</h1>
                <p style={{color:'red'}}>{this.state.msg}</p>
                <label><b>Username</b></label>
                <input type="text" placeholder="Enter Username" name="username" onChange={this.handleChange} required/>

                <label><b>Password</b></label>
                <input type="password" placeholder="Enter Password" name="psw" onChange={this.handleChange} required/>
                
            </form>
            <button onClick={() => this.login()} >Login</button>
            
            <h2>username: {this.state.username}</h2>
            <h2>psw: {this.state.psw}</h2>
        </div>
     );
    }
  
  }