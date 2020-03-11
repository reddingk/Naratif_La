import React, { Component } from 'react';

var localSock = null;

class JSearch extends Component{
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            search:""
        }  

        this.handleChange = this.handleChange.bind(this); 
        this.handleSubmit = this.handleSubmit.bind(this); 
        this.socketDeclaration = this.socketDeclaration.bind(this);
    }
   
    render(){        
        return(
            <div className={"jSearch-container" + (this.state.open ? " open" : "")}>
                <div className="jSearch-btn" onClick={() => this.setState({open: !this.state.open})}>
                    <div className="jctr j1"/>
                    <div className="jctr j2"/>
                </div>

                <input name="search" type="text" className="jSearch-bar" value={this.state.search} onChange={(e) => this.handleChange(e)} onKeyPress={(e) => this.handleSubmit(e)}/>
            </div>
        );        
    }

    componentDidMount(){
        this.socketDeclaration(this.props.localSock);
    }

    handleChange(e){
        try {            
            this.setState({[e.target.name]: e.target.value });
        }
        catch(ex){
            console.log("Error handling change data: ",ex);
        }
    }

    handleSubmit(e){
        try {
            if(e.charCode == 13 && e.shiftKey == false) {
                e.preventDefault();
                if(!localSock || localSock.listeners('jada').length <= 0) {
                    this.socketDeclaration(this.props.localSock);
                }

                if(localSock){
                    var dataMsg = {"rID":this.props.jUser.userId, "type":"phrase", "input":this.state.search };           
                    localSock.emit('jada', dataMsg);
                }
                else {
                    alert("Connection is no activated.");
                }
            }
        }
        catch(ex){
            console.log("Error handling submit data: ",ex);
        }
    }

    /* Socket */
    socketDeclaration(tmpSock){
        var self = this;
        try {        
            if(tmpSock){    
                tmpSock.on('jada', function(res){
                    console.log(res);                   
                });
                localSock = tmpSock;
            }
        }
        catch(ex){
            console.log("Error with socket declaration: ", ex);
        }
    }
}

export default JSearch;