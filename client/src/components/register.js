import React, { Component } from 'react';

export default class Register extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            email: "",
            psw: "",
            repeat_psw: "",
            msg: ""
        }
        this.handleChange = this.handleChange.bind(this);
    };
        
  
    async componentDidMount() {
      
    }

    async register(){
        if(this.state.psw === this.state.repeat_psw){
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: this.state.username, email: this.state.email, phone: "TODO", password: this.state.psw})
            };
            fetch('http://localhost:3000/auth/register', requestOptions)
                .then(response => response.json())
                .then(data => {
                    if(data.success === "True"){
                        this.setState({msg: data.message})
                        //TODO change pages to enter app
                    }
                    else{
                        this.setState({msg: data.error})
                    }
                });

        }
        else{
            this.setState({msg: "Error, password and repeated password does not correspond!"})
        }

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
            <h1>Register</h1>
            <p>Please fill in this form to create an account.</p>
            <p style={{color:'red'}}>{this.state.msg}</p>
            <label><b>Username</b></label>
            <input type="text" placeholder="Enter Username" name="username" onChange={this.handleChange} required/>

            <label><b>Email</b></label>
            <input type="text" placeholder="Enter Email" name="email" onChange={this.handleChange} required/>

            <label><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="psw" onChange={this.handleChange} required/>

            <label><b>Repeat Password</b></label>
            <input type="password" placeholder="Repeat Password" name="repeat_psw" onChange={this.handleChange} required/>
            
            <p>By creating an account you agree to our <a href="#">Terms & Privacy</a>.</p>
        </form>
        <button onClick={() => this.register()} >Register</button>
            
            <h2>username: {this.state.username}</h2>
            <h2>email: {this.state.email}</h2>
            <h2>psw: {this.state.psw}</h2>
            <h2>psw_repeat: {this.state.repeat_psw}</h2>
        </div>
     );
    }
  
  }