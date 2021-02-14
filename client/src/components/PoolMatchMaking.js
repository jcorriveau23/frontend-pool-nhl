import React, { Component } from 'react';

export default class PoolMatchMaking extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: ""
        }
        this.handleChange = this.handleChange.bind(this);
    };
        
  
    async componentDidMount() {
      
    }
    
    handleChange(event) {
        const target = event.target;
        const name = target.name;

        this.setState({[name]: target.value});
    }
  
    render() {
      return(
        <div>

        </div>

      )
    
    }
}