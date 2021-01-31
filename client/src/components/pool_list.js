import React, { Component } from 'react';

export default class CreatePool extends Component {
    constructor(props) {
      super(props);
        // variable from this page
        this.state = {
            username: ""
        }
        this.handleChange = this.handleChange.bind(this);
    };
        
  
    async componentDidMount() {
      //TODO get username
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
            <h1>Pool list (TODO)</h1>

            
        </div>
     );
    }
  
  }