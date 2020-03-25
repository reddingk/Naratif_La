import React, { Component } from 'react';
import { isNotEmpty } from '@amcharts/amcharts4/.internal/core/utils/Utils';

class Fillmore extends Component{
    constructor(props) {
        super(props);

        this.state = {
            connections:[
                {"connectionId":"F3-Test1", "nickname":"F3-Test1"},
                {"connectionId":"F3-Test2", "nickname":"F3-Test2"},
                {"connectionId":"F3-Test3", "nickname":"F3-Test3"},
                {"connectionId":"F3-Test4", "nickname":"F3-Test4"},
            ]
        }
    }
   
    render(){        
        return(
            <div className="page-container fillmore-page">
                <div className="ctrl-container">
                    <div className="ctrl-conn">
                        <div className="title-section">
                            <h1>JNetwork</h1>
                        </div>
                        <div className="conn-list">
                            {this.state.connections.map((conn,i) =>
                                <div className="conn-item" key={i}>
                                    <div className="item-title">{conn.connectionId}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="ctrl-body">

                    </div>
                </div>
            </div>
        );        
    }

    componentDidMount(){}
}

export default Fillmore;