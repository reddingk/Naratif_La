import React, { Component } from 'react';

class UC extends Component{
    constructor(props) {
        super(props);

        this.state = {}
    }
   
    render(){        
        return(
            <div className="page-container">
                <h1>{this.props.name}</h1>
            </div>
        );        
    }

    componentDidMount(){}
}

export default UC;