import React, { Component } from 'react';
import Cookies from 'js-cookie';

export default class CreatePool extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: "",
            pool_created: [],
            pool_in_progress: [],
            pool_draft: [],
            pool_dynastie: []
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
        if(data.success === "False"){
          this.props.history.push('/Login');
        }
        else{
          

          var pool_draft = []
          var pool_in_progress = []
          var pool_dynastie = []
          console.log(data.pool_created)
          console.log(data.user_pools_info)

          for(var i=0; i < data.user_pools_info.length; i++){
            if (data.user_pools_info[i]['status'] === 'draft'){
              pool_draft.push({name: data.user_pools_info[i]['name'], owner: data.user_pools_info[i]['owner']})
            }
            else if (data.user_pools_info[i]['status'] === 'in Progress'){
              pool_in_progress.push({name: data.user_pools_info[i]['name'], owner: data.user_pools_info[i]['owner']})
            }
            else if (data.user_pools_info[i]['status'] === 'dynastie'){
              pool_dynastie.push({name: data.user_pools_info[i]['name'], owner: data.user_pools_info[i]['owner']})
            } 
          }
          this.setState({ 
                          pool_created: data.pool_created,
                          pool_draft: pool_draft,
                          pool_in_progress: pool_in_progress,
                          pool_dynastie: pool_dynastie
                        })
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
            <h2>Created</h2>
            {this.state.pool_created.map(pool => 
            <li onClick={() => this.props.history.push({pathname: '/pool_list/' + pool.name, state: {pool_name: pool.name}})}><a href="">Pool name: {pool.name}  : Owner: {pool.owner}</a></li>
            )}
            <h2>Drafting</h2>
            {this.state.pool_draft.map(pool => 
            <li onClick={() => this.props.history.push({pathname: '/pool_list/' + pool.name, state: {pool_name: pool.name}})}><a href="">Pool name: {pool.name}  : Owner: {pool.owner}</a></li>
            )}
            <h2>Dynastie</h2>
            {this.state.pool_dynastie.map(pool => 
            <li onClick={() => this.props.history.push({pathname: '/pool_list/' + pool.name, state: {pool_name: pool.name}})}><a href="">Pool name: {pool.name}  : Owner: {pool.owner}</a></li>
            )}
            <h2>in Progress</h2>
            {this.state.pool_in_progress.map(pool => 
            <li onClick={() => this.props.history.push({pathname: '/pool_list/' + pool.name, state: {pool_name: pool.name}})}><a href="">Pool name: {pool.name}  : Owner: {pool.owner}</a></li>
            )}
        </div>
     );
    }
  
  }