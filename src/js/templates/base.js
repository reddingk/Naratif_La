import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

/* Models */
import characterModel from '../../datamodels/character.model';

/* Styles */
import "../../css/app.less";

/* Components */
import UC from './uc';
import Gerald from './gerald';
import LilBill from './lilBill';
import RooseveltFranklin from './rooseveltFranklin';
import Susie from './susie';

import SocketConnect from './components/socketConnect';

class Base extends Component {
    constructor(props) {
        super(props);
        this.state = {         
          selectedChar: "gerald",
          forwardDir: true,
          selectedItem: null,
          dataLibrary:{},
          localSock:null
        };
          
        this.changeSelectedChar = this.changeSelectedChar.bind(this);
        this.renderSwitch = this.renderSwitch.bind(this);
        this.socketDeclaration = this.socketDeclaration.bind(this);

        this.characterList = {
           "gerald": new characterModel("Gerald", <Gerald jConnect={this.props.jConnect} jUser={this.props.jUser} localSock={this.state.localSock} />, "Gerald"),
           "lilbill": new characterModel("LilBill", <LilBill />, "Little Bill"),
           "rooseveltfranklin": new characterModel("RooseveltFranklin", <RooseveltFranklin />, "Roosevelt Franklin"),
           "susie": new characterModel("Susie", <Susie jConnect={this.props.jConnect} jUser={this.props.jUser} localSock={this.state.localSock}/>, "Susie")           
        };
    }

    changeSelectedChar(newChar){
        var nameArray = Object.values(this.characterList).map(function(item){ return item.name.toLowerCase(); });
        var forward = nameArray.indexOf(newChar.toLowerCase()) >= nameArray.indexOf(this.state.selectedChar);
        
        this.setState({ forwardDir:forward, selectedChar: newChar.toLowerCase(), selectedItem: this.characterList[newChar.toLowerCase()] });
    }

    renderSwitch(param) {
        let tmpChar = (param != null ? this.characterList[param.toLowerCase()].bodyComponent : null);
        return ( !tmpChar ? this.characterList["gerald"].bodyComponent : tmpChar);
    }

    socketDeclaration(tmpSock){        
        try {            
            this.setState({ localSock: tmpSock });                 
        }
        catch(ex){
            console.log("Error with socket declaration: ", ex);
        }
    }

    joinNetwork(){
        var self = this;
        try {
            let connectSrc = new EventSource(self.props.jConnect.urlBase +'/connect/'+self.props.jUser.userId);
  
            connectSrc.onmessage = function(e){
                var jdata = JSON.parse(e.data);
  
                if(jdata.command){
                    self.commander(jdata.command, jdata.data);
                }
            }
        }
        catch(ex){
            console.log("Error With JNetwork Connection: ", ex);
        }
    }

    render(){    
        var charList = Object.values(this.characterList); 
        return(
          <div className="main-body">
            <SocketConnect baseUrl={this.props.jConnect.coreUrlBase} user={this.props.jUser} socketDeclaration={this.socketDeclaration}/>

            <div className="side-nav">
                {charList.map((item, i) => 
                    <div className={"nav-btn " + item.colorClass + (this.state.selectedChar == item.name.toLowerCase() ? " selected" : "")} key={i} onClick={() => this.changeSelectedChar(item.name)}></div>
                )}
            </div>
            <CSSTransitionGroup transitionName={(this.state.forwardDir ? "cardSlide" : "reverseCardSlide")} transitionAppear={false}
                                transitionLeave={true} transitionLeaveTimeout={3000}
                                transitionEnter={true} transitionEnterTimeout={3000}>
                <div key={this.state.selectedChar} className="body-container">{ this.renderSwitch(this.state.selectedChar)}</div>                       
            </CSSTransitionGroup>
          </div>         
        );
    }

    componentDidMount(){         
        /* [REMOVE] */
        //this.joinNetwork();
    }

    /* jNetwork Functions */
    commander(cmd,data){
        switch(cmd){
        case 'connectionList':
            this.updateConnectionList(data);
            break;
        default:
            break;
        }
    }

    /* Update Connection List */
    updateConnectionList(newList){
        var self = this;
        try {
            console.log("Debug: Updated Connection List");
            for(var i=0; i < newList.length; i++){
                if(self.conList && !(newList[i].connectionId in self.conList)){
                        self.props.jConnect.conList[newList[i].connectionId] = newList[i];
                }
            }
        }
        catch(ex){
            console.log("Error Updating connection list: ", ex);
        }
    }
}

export default Base;