import React, { Component } from 'react';

class UserView extends Component{
    constructor(props) {
        super(props);

        this.state = {
            userId:""
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.verifyUser = this.verifyUser.bind(this);
    }
   
    render(){        
        return(
            <div className="uv-container">
                <div className="uv-text">
                    <div className="input-container sz-3">
                        <input type="text" name="userId" placeholder="Enter You User Name" value={this.state.userId} onChange={(e) => this.handleInputChange(e)} />     
                        <div className="input-btn" onClick={this.verifyUser}/>
                    </div>
                </div>
            </div>
        );        
    }

    componentDidMount(){}
    
    handleInputChange(event){
        try {
            var name = event.target.name;          
            if(name in this.state){
                this.setState({ [name]:event.target.value });
            }            
        }
        catch(ex){
            console.log(" [Error] with input change: ",ex);
        }
    }

    verifyUser(){
        try {
            this.props.updateUID(this.state.userId);
        }
        catch(ex){
            console.log(" [Error] verifing user: ",ex);
        }
    }
}

export default UserView;