import React, { Component } from 'react';
import AccessPad from './components/accessPad';
import UserView from './components/userView';
import SocketConnect from './components/socketConnect';
import LoadSpinner from './components/loadSpinner';

var localSock = null;

class Access extends Component{
    constructor(props) {
        super(props);
        this.state = {
            userId: null,
            key:null,
            error: null,
            loading: false
        }
        this.updateUID = this.updateUID.bind(this);
        this.submitKey = this.submitKey.bind(this);
        this.socketDeclaration = this.socketDeclaration.bind(this);
        this.handleJAuth = this.handleJAuth.bind(this);
        this.randomUsr = this.randomUsr.bind(this);
        this.signOutUser = this.signOutUser.bind(this);
    }
   
    render(){        
        return(
            <div className="main-body access">
                <SocketConnect baseUrl={this.props.jConnect.coreUrlBase} user={this.randomUsr()} socketDeclaration={this.socketDeclaration} signOut={this.signOutUser}/>

                <div className="body-container main-access">
                    <div className="page-container">
                        {this.state.error != null && <div className="accessErrorMsg">{this.state.error}</div>}
                        {this.state.loading && <LoadSpinner userClass="base" /> }
                        {(this.state.userId == null ? 
                            <UserView updateUID={this.updateUID}/> : <AccessPad submitKey={this.submitKey} />
                        )}
                    </div>
                </div>
            </div>
        );        
    }

    componentDidMount(){}

    randomUsr(){
        var ret = { userId:null, token:null};
        try {
            var d = new Date();
            var random = Math.ceil(Math.random() * 15000);

            ret.token = d.getTime();
            ret.user = "access-"+random+"-usr-"+d.getTime();
        }
        catch(ex){
            console.log("[Error] with random user gen: ",ex);
        }
        return ret;
    }

    updateUID(userId){
        try {
            this.setState({userId: userId, error: null});
        }
        catch(ex){
            console.log("[Error] updating user: ", ex);
        }
    }

    submitKey(keyId){
        var self = this;
        try {
            
            this.setState({ loading:true, key: keyId }, () => {
                localSock.emit('jauth', {"userId":self.state.userId, "password":self.state.key});
                //self.props.userHandler({_id: "5ba02d36ea65672f28f6eec2", userId: self.state.userId, name: "Kris Redding", token: "J6968MjfCFaeMHMt8kDAA1"});
            });
        }
        catch(ex){
            console.log(" [Error] Submitting Key: ", ex);
        }
    }

    socketDeclaration(tmpSock){
        var self = this;
        try {            
            tmpSock.on('jauth', function(res){
                self.handleJAuth(res);           
            });
            localSock = tmpSock;
        }
        catch(ex){
            console.log("Error with socket declaration: ", ex);
        }
    }

    handleJAuth(res){
        var self = this;
        try {
            if(res.error){
                this.setState({ userId: null, key:null, error: res.error, loading:false });
            }
            else {
                this.setState({loading: false }, ()=>{
                    self.props.userHandler(res.data);
                });
            }
        }
        catch(ex){
            console.log("[Error] with jAuth: ", ex);
        }
    }

    signOutUser(){
        try {
            this.props.userHandler({});
        }
        catch(ex){
            console.log("Error Signing User Out: ",ex);
        }
    }
}

export default Access;