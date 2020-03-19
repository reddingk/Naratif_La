import React, { Component } from 'react';
/* Components */
import LoadSpinner from '../components/loadSpinner';

const axios = require('axios');

class JResponse extends Component {
    constructor(props){
        super(props);
        this.state = {};

        this.renderSwitch = this.renderSwitch.bind(this);
    }

    renderSwitch(item){
        try {
            switch(item.type){
                case "weather":
                    if(item.data.dateList) {
                        return <div className="weather-list">
                                {item.data.dateList.map((item,i) =>
                                    <div className="list-item" key={i}>
                                        <img className="item-icon" src={"imgs/"+item.weather[0].icon+".png"}/>
                                        <span className="item-degree">{item.main.temp}&#176;</span>
                                        <span className="item-date">{item.dt_txt}</span>
                                    </div>
                                )}
                            </div>;
                    }
                    else if(Array.isArray(item.data)) {
                        return <div className="weather-list">
                                {item.data.map((item,i) =>
                                    <div className="list-item"  key={i}>
                                        <img className="item-icon" src={"imgs/"+item.weather[0].icon+".png"}/>
                                        <span className="item-degree">{item.main.temp}&#176;</span>
                                        <span className="item-date">{item.dt_txt}</span>
                                    </div>
                                )}
                            </div>;
                    }
                    else {
                        return <span>{item.answer}</span>;
                    }
                    break;
                default:
                    return <span>{item.answer}</span>;
                    break;
            }
        }
        catch(ex){
            console.log("Error displaying answer" ,ex );
            return <span />;
        }
    }

    render() {
        return (
            <div className="item-answer">
                {this.renderSwitch(this.props.answer)}
            </div>
        )
    }
}

class JSearch extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            loader: false,
            search:"",
            convo:[]
        }  

        this.handleChange = this.handleChange.bind(this); 
        this.handleSubmit = this.handleSubmit.bind(this); 
        this.processSearch = this.processSearch.bind(this);
    }
   
    render(){        
        return(
            <div className={"jSearch-container "+ this.props.character + (this.state.open ? " open" : "")}>
                <div className="jSearch-line">
                    <div className="jSearch-btn" onClick={() => this.setState({open: !this.state.open})}>
                        <div className="jctr j1"/>
                        <div className="jctr j2"/>
                    </div>

                    <input name="search" type="text" className="jSearch-bar" value={this.state.search} onChange={(e) => this.handleChange(e)} onKeyPress={(e) => this.handleSubmit(e)}/>
                </div>

                <div className={"convo-container" + (this.state.loader ? " loading" : "")}>
                    {this.state.loader && <LoadSpinner userClass="" /> }
                    {this.state.convo.map((item,i) =>
                        <div className="convo-item" key={i}>
                            <div className="item-line left"><div className="item-question">{item.question}</div></div>
                            {/*<div className="item-line right"><div className="item-answer">{item.answer}</div></div> */}
                            <div className="item-line right"><JResponse answer={item}/></div>
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
                var tmpSearch = self.state.search;

                this.setState({ loader: true }, () =>{
                    axios.post(url, dataMsg, {}).then(res => { 
                        if(!res || res.data.error){
                            self.setState({ loader: false }, () => {
                                console.log(res.data.error);
                            });
                        }
                        else {
                            self.setState({ search: "", loader: false }, () => {
                                self.processSearch(tmpSearch, res.data);
                            });                            
                        }
                    })
                    .catch(error => { 
                        console.log("[Error] " + error.message);
                    });
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
            tmpConvo.push({ question: query, answer: results.jresponse, type: results.jtype, data: results.jdata });

            this.setState({convo: tmpConvo });
        }
        catch(ex){
            console.log("Error processing search data: ",ex);
        }
    }
}

export default JSearch;