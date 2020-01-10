import React, { Component } from 'react';

/* Components */

class LoadSpinner extends Component{
    constructor(props) {
        super(props);

        this.state = {
            userClass:''
        }        
    }      

    render(){        
        return(
            <div id="loader-wrapper">
                <div id="loader" className={ ''+this.state.userClass }></div>
            </div>
        );        
    }

    componentDidMount(){ 
        var uClass = (this.props.userClass ? this.props.userClass : 'default');
        this.setState({userClass: uClass});
    }
}

export default LoadSpinner;