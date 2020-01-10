import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';

var localSock = null;
/*
0: not connected
1: connected
2: connection failed
3: reconnect attempt
*/

class SocketConnect extends Component{
    constructor(props) {
        super(props);

        this.state = {                       
            status:0,
            statusText:null,
            statusIcon:null,                      
            reconnectAttempts: 5,
            reconnectionDelay: 1000
        }

        this.initSocket = this.initSocket.bind(this);
        this.setConnectionView = this.setConnectionView.bind(this);
    }

    render(){  
        return(
            <div className={"sc-container status-" +  this.state.status}>
                <i className={"sc-item sc-icon " + this.state.statusIcon}></i>
                <div className="sc-item sc-text">Connection Status: {this.state.statusText}</div>
                {(this.state.status === 0 || this.state.status === 2) &&
                    <div className="sc-item sc-retry-btn" onClick={this.initSocket}><i className="fas fa-redo"></i><span>Retry</span></div>
                }
            </div>
        );
    }
    
    componentDidMount(){
        this.setConnectionView();
        this.initSocket();
    }

    componentWillUnmount() {
        if(localSock){ localSock.close();  }
    }

    setConnectionView(){     
        try {
            switch(this.state.status){
                case 0:
                    this.setState({ statusText: "not connected", statusIcon: "far fa-times-circle"});
                    break;
                case 1:
                    this.setState({ statusText: "connected", statusIcon: "fas fa-check"});
                    break;
                case 2:
                    this.setState({ statusText: "connection attempt failed", statusIcon: "fas fa-ban"});
                    break;
                case 3:
                    this.setState({ statusText: "reconnecting", statusIcon: "fas fa-sync fa-spin"});
                    break;
                default:
                    break;
            }
        }
        catch(ex){
            console.log("Error setting connection view: ",ex);
        }
    }

    initSocket(){
        var self = this;
        try{
            if(localSock){ localSock.close();  }
            
            var socketQuery = "userid="+ this.props.user.userId +"&token="+ this.props.user.token;
            localSock = socketIOClient(self.props.baseUrl, { 
                query: socketQuery, 
                reconnectionAttempts: this.state.reconnectAttempts, 
                reconnectionDelay: this.state.reconnectionDelay });           
            
            localSock.on('connect',function() { 
                self.setState({status: 1}, () => { self.setConnectionView(); });
                self.props.socketDeclaration(localSock);
            });

            localSock.on('reconnect',function(attemptNumber) { 
                self.setState({status: 1}, () => { self.setConnectionView(); });
            });

            localSock.on('disconnect',function() { 
                self.setState({status: 2}, () => { self.setConnectionView(); });
            });

            localSock.on('reconnect_failed',function(attemptNumber) { 
                self.setState({status: 2}, () => { self.setConnectionView(); });
            });

            localSock.on('reconnect_attempt',function(attemptNumber) { 
                self.setState({status: 3}, () => { self.setConnectionView(); });
            });            
        }
        catch(ex){
            console.log("Error connecting to socket: ",ex);
        }        
    }
}
export default SocketConnect;