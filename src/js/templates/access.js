import React, { Component } from 'react';
import AccessPad from './components/accessPad';
import UserView from './components/userView';

class Access extends Component{
    constructor(props) {
        super(props);
        this.state = {
            userId: null,
            key:null
        }
        this.updateUID = this.updateUID.bind(this);
        this.submitKey = this.submitKey.bind(this);
    }
   
    render(){        
        return(
            <div className="main-body access">
                <div className="body-container main-access">
                    <div className="page-container">
                        {(this.state.userId == null ? 
                            <UserView updateUID={this.updateUID}/> : <AccessPad submitKey={this.submitKey} />
                        )}
                    </div>
                </div>
            </div>
        );        
    }

    componentDidMount(){}

    updateUID(userId){
        try {
            this.setState({userId: userId});
        }
        catch(ex){
            console.log("[Error] updating user: ", ex);
        }
    }

    submitKey(keyId){
        var self = this;
        try {
            console.log(keyId);
            this.setState({ key: keyId }, () => {
                var tmpUser = {_id: "5ba02d36ea65672f28f6eec2", userId: self.state.userId, name: "Kris Redding", token: "J6968MjfCFaeMHMt8kDAA1"}
                self.props.userHandler(tmpUser);
            });
        }
        catch(ex){
            console.log(" [Error] Submitting Key: ", ex);
        }
    }
}

export default Access;