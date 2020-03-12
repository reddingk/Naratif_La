import React, { Component } from 'react';
const axios = require('axios');

var localSock = null;

class JSearch extends Component{
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            search:"",
            convo:[]
        }  

        this.handleChange = this.handleChange.bind(this); 
        this.handleSubmit = this.handleSubmit.bind(this); 
        this.processSearch = this.processSearch.bind(this);
    }
   
    render(){        
        return(
            <div className={"jSearch-container" + (this.state.open ? " open" : "")}>
                <div className="jSearch-line">
                    <div className="jSearch-btn" onClick={() => this.setState({open: !this.state.open})}>
                        <div className="jctr j1"/>
                        <div className="jctr j2"/>
                    </div>

                    <input name="search" type="text" className="jSearch-bar" value={this.state.search} onChange={(e) => this.handleChange(e)} onKeyPress={(e) => this.handleSubmit(e)}/>
                </div>

                <div className="convo-container">
                    {this.state.convo.map((item,i) =>
                        <div className="convo-item" key={i}>
                            <div className="item-line left"><div className="item-question">{item.question}</div></div>
                            <div className="item-line right"><div className="item-answer">{item.answer}</div></div>
                        </div>
                    )}
                </div>
            </div>
        );        
    }

    componentDidMount(){}

    handleChange(e){
        try {            
            this.setState({[e.target.name]: e.target.value });
        }
        catch(ex){
            console.log("Error handling change data: ",ex);
        }
    }

    handleSubmit(e){
        var self = this;
        try {
            if(e.charCode == 13 && e.shiftKey == false) {
                e.preventDefault();
                var dataMsg = { "userId":this.props.jUser.userId, "token":this.props.jUser.token, "phrase":this.state.search };           
                var url = this.props.jConnect.coreUrlBase+"/japi/talk";

                axios.post(url, dataMsg, {}).then(res => { 
                        if(!res || res.data.error){
                            console.log(res.data.error);
                        }
                        else {
                            self.processSearch(self.state.search, res.data);
                        }
                    })
                    .catch(error => { 
                        console.log("[Error] " + error.message);
                    });
            }
        }
        catch(ex){
            console.log("Error handling submit data: ",ex);
        }
    }

    processSearch(query, results){
        try {
            var tmpConvo = this.state.convo;
            tmpConvo.push({ question: query, answer: results.jresponse });

            this.setState({convo: tmpConvo });
        }
        catch(ex){
            console.log("Error processing search data: ",ex);
        }
    }
}

export default JSearch;