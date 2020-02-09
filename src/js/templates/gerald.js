import React, { Component } from 'react';

/* Charts */
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_timeline from "@amcharts/amcharts4/plugins/timeline";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4plugins_bullets from "@amcharts/amcharts4/plugins/bullets";

/* Components */
import SocketConnect from './components/socketConnect';
import LoadSpinner from './components/loadSpinner';

var localSock = null;

// Themes begin
am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

class Gerald extends Component{
    constructor(props) {
        super(props);
        this.state = {
            greeting:null,
            weather:null,
            movies: null,
            weatherIcons:{
                "01d":"imgs/01d.png", "01n":"imgs/01n.png",
                "02d":"imgs/02d.png", "02n":"imgs/02n.png",
                "03d":"imgs/03d.png", "03n":"imgs/03n.png",
                "04d":"imgs/04d.png", "04n":"imgs/04n.png",
                "09d":"imgs/09d.png", "09n":"imgs/09n.png",
                "10d":"imgs/10d.png", "10n":"imgs/10n.png",
                "11d":"imgs/11d.png", "11n":"imgs/11n.png",
                "13d":"imgs/13d.png", "13n":"imgs/13n.png",
                "50d":"imgs/50d.png", "50n":"imgs/50n.png",
            }
        }

        this.displayData = this.displayData.bind(this);
        this.loadDashboard = this.loadDashboard.bind(this);
        this.socketDeclaration = this.socketDeclaration.bind(this);

        this.setWeatherTimeline = this.setWeatherTimeline.bind(this);
    }  

    componentDidMount(){
        this.socketDeclaration(this.props.localSock);
    }

    render(){        
        return(
            <div className="page-container gerald-page">
                {/* <SocketConnect baseUrl={this.props.jConnect.coreUrlBase} user={this.props.jUser} socketDeclaration={this.socketDeclaration}/> */}

                <div className="data-container">
                    {/* Greetings */}
                    <div className="data-section">{ this.state.greeting }</div>
                    {/* Weather */}
                    <div className="data-section weather">
                        { !this.state.weather ?
                        <LoadSpinner userClass="gerald" /> :
                        <div className="geraldTimeline" id="weatherTimeline"></div> }
                    </div>
                    {/* Movies */}
                    <div className="data-section movies">
                        { !this.state.movies ?
                            <LoadSpinner userClass="gerald" /> :
                            <div className="movielist-container">
                                {this.state.movies.map((movie,i) =>
                                    <div className="movie-item" key={i}>
                                        <div className="item-container">
                                            <img src={movie.poster_path} />
                                        </div>
                                        <div className="item-container content">
                                            <div className="movie-title">{movie.title}</div>
                                            <div className="movie-date">{movie.release_date}</div>                                            
                                            {/*<div className="movie-overview">{movie.overview}</div>*/}
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );        
    }

     /* Socket */    
     socketDeclaration(tmpSock){
        var self = this;
        try {        
            if(tmpSock){    
                tmpSock.on('jada', function(res){
                    self.displayData(res.data);                   
                });
                localSock = tmpSock;

                // Load Data
                self.loadDashboard();
            }
        }
        catch(ex){
            console.log("Error with socket declaration: ", ex);
        }
    }

    /* Load Data */
    displayData(data) {
        var self = this;
        try{
            switch(data.jtype){
                case "greeting":
                    self.setState({ "greeting":data.jdata.results });
                    break;
                case "weather":
                    self.setState({ "weather":data.jdata },() => {
                        self.setWeatherTimeline(self.state.weather);
                    });
                    break;
                case "movie":
                    self.setState({ "movies":data.jdata });
                    break;
                default:
                    break;
            }
        }
        catch(ex){
            console.log("Error Loading Socket Data: ", ex);
        }
    }

    /* Dashboard Calls */
    loadDashboard(){
        var self = this;
        try {
            var dataMsg = {};
            if(localSock){
                /* Greeting */
                dataMsg = {"rID":self.props.jUser.userId, "type":"phrase", "input":"Hello" };           
                localSock.emit('jada', dataMsg); 

                /* Weather Details */
                dataMsg = {"rID":self.props.jUser.userId, "type":"phrase", "input":"weather forecast for laurel, md." };           
                localSock.emit('jada', dataMsg);

                /* Now Playing Movies */
                dataMsg = {"rID":self.props.jUser.userId, "type":"phrase", "input":"list movies now playing" };           
                localSock.emit('jada', dataMsg);
            }
        }
        catch(ex){
            console.log("Error Dashboard Calls: ",ex);
        }
    }

    /* Set Weather Timeline */
    setWeatherTimeline(data){
        var self = this;
        try {
            var chart = am4core.create("weatherTimeline", am4plugins_timeline.SerpentineChart);

            chart.curveContainer.padding(100, 20, 50, 20);
            chart.levelCount = 3;
            chart.yAxisRadius = am4core.percent(20);
            chart.yAxisInnerRadius = am4core.percent(2);
            chart.maskBullets = false;

            var colorSet = new am4core.ColorSet();

            chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";
            chart.dateFormatter.dateFormat = "HH";

            var formattedData = data.dateList.map(function(time,i){
                var endDate = new Date(time.dt_txt);
                endDate.setTime(endDate.getTime() + (86400000));

                var months = ["Mon","Tues","Wed","Thurs","Fri","Sat","Sun"];
                var displayTxt = months[(new Date(time.dt_txt)).getDay()] + ": " + time.main.temp;

                var retData = { "category": "", "color": colorSet.getIndex(i), "textDisabled": false, "text":displayTxt, 
                "icon":self.state.weatherIcons[time.weather[0].icon], "start":time.dt_txt,"end":endDate};
                return retData;
            });
            chart.data = formattedData;

            chart.fontSize = 12;
            chart.tooltipContainer.fontSize = 10;

            var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.grid.template.disabled = true;
            categoryAxis.renderer.labels.template.paddingRight = 25;
            categoryAxis.renderer.minGridDistance = 10;

            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 70;
            dateAxis.baseInterval = { count: 180, timeUnit: "minute" };
            dateAxis.renderer.tooltipLocation = 0;
            dateAxis.renderer.line.strokeDasharray = "1,4";
            dateAxis.renderer.line.strokeOpacity = 0.5;
            dateAxis.tooltip.background.fillOpacity = 0.2;
            dateAxis.tooltip.background.cornerRadius = 5;
            dateAxis.tooltip.label.fill = new am4core.InterfaceColorSet().getFor("alternativeBackground");
            dateAxis.tooltip.label.paddingTop = 7;
            dateAxis.endLocation = 0;
            dateAxis.startLocation = -0.5;

            var labelTemplate = dateAxis.renderer.labels.template;
            labelTemplate.verticalCenter = "middle";
            labelTemplate.fillOpacity = 0.4;
            labelTemplate.background.fill = new am4core.InterfaceColorSet().getFor("background");
            labelTemplate.background.fillOpacity = 1;
            labelTemplate.padding(2, 2, 2, 2);

            var series = chart.series.push(new am4plugins_timeline.CurveColumnSeries());
            series.columns.template.height = am4core.percent(15);

            series.dataFields.openDateX = "start";
            series.dataFields.dateX = "end";
            series.dataFields.categoryY = "category";
            series.baseAxis = categoryAxis;
            series.columns.template.propertyFields.fill = "color";
            series.columns.template.propertyFields.stroke = "color";
            series.columns.template.strokeOpacity = 0;
            series.columns.template.fillOpacity = 0.6;

            var imageBullet1 = series.bullets.push(new am4plugins_bullets.PinBullet());
            imageBullet1.locationX = 1;
            imageBullet1.propertyFields.stroke = "color";
            imageBullet1.background.propertyFields.fill = "color";
            imageBullet1.image = new am4core.Image();
            imageBullet1.image.propertyFields.href = "icon";
            imageBullet1.image.scale = 0.5;
            imageBullet1.circle.radius = am4core.percent(100);
            imageBullet1.dy = -5;


            var textBullet = series.bullets.push(new am4charts.LabelBullet());
            textBullet.label.propertyFields.text = "text";
            textBullet.disabled = true;
            textBullet.propertyFields.disabled = "textDisabled";
            textBullet.label.strokeOpacity = 0;
            textBullet.locationX = 1;
            textBullet.dy = -100;
            textBullet.label.textAlign = "middle";

            chart.scrollbarX = new am4core.Scrollbar();
            chart.scrollbarX.align = "center"
            chart.scrollbarX.width = am4core.percent(75);
            chart.scrollbarX.opacity = 0.5;

            var cursor = new am4plugins_timeline.CurveCursor();
            chart.cursor = cursor;
            cursor.xAxis = dateAxis;
            cursor.yAxis = categoryAxis;
            cursor.lineY.disabled = true;
            cursor.lineX.strokeDasharray = "1,4";
            cursor.lineX.strokeOpacity = 1;

            dateAxis.renderer.tooltipLocation2 = 0;
            categoryAxis.cursorTooltipEnabled = false;
        }
        catch(ex){
            console.log("Error setting weather timeline: ",ex);
        }
    }
}

export default Gerald;