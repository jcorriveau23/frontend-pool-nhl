import React, { Component } from 'react';
import Cookies from 'js-cookie';

export default class CreatePool extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            pool_list: []
        }
        this.handleChange = this.handleChange.bind(this);
    };
        
  
    async componentDidMount() {
      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'token': Cookies.get('token')}
      };
      fetch('pool/pool_list', requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data.message)
        console.log(data.success)
        if(data.success === "False"){
          this.props.history.push('/');
        }
        else{
          this.setState({pool_list: data.message})
        }
          
      })

    }

    async go_to_pool(){
        // TODO go to pool information
    }
    
    handleChange(event) {
        const target = event.target;
        const name = target.name;

        this.setState({[name]: target.value});
    }
  
    render() {
      return(
        <div>
            <h1>Pool list</h1>
            {this.state.pool_list.map(pool => 
            <li onClick={() => this.props.history.push({pathname: '/pool_list/' + pool.name, state: {pool_name: pool.name}})}><a href="">Pool name: {pool.name}  : Owner: {pool.owner}</a></li>
            )}
        </div>
     );
    }
  
  }