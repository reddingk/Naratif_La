import React, { Component } from 'react';
import { loadModules, setDefaultOptions } from 'esri-loader';

/* Components */
import LoadSpinner from './components/loadSpinner';

/* Charts */
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Themes begin
am4core.useTheme(am4themes_animated);

const { ipcRenderer } = window.require("electron");

class LilBill extends Component{
    constructor(props) {
        super(props);

        this.state = {
            location:{},
            sysInfoList:["cpu", "networkInterfaces", "fsSize", "system", "osInfo", "wifiNetworks"/*, "mem"*/],
            cpu: null,
            networkInterfaces:null, 
            mem:null, 
            fsSize:null, 
            battery:null, 
            system:null, 
            osInfo:null, 
            wifiNetworks:null
        }

        this.initRender = this.initRender.bind(this);
        this.getAllDesktopData = this.getAllDesktopData.bind(this);
        this.loadMaps = this.loadMaps.bind(this);
        this.createGauge = this.createGauge.bind(this);

        this.mapRef = React.createRef();
    }
   
    render(){        
        return(
            <div className="page-container lilBill-page">
                <div className="arcMap" ref={ this.mapRef }>
                    <div className="map-fade fade-top"/>
                    <div className="map-fade fade-left"/>
                    <div className="map-fade fade-bottom"/>
                    <div className="map-fade fade-right"/>
                </div>

                <div className="data-container">
                    {/* System Info */}
                    <div className="data-section">
                        {!this.state.system || !this.state.osInfo ?
                            <LoadSpinner userClass="lilBill" /> :
                            <div className="txt-data">
                                <p>{this.state.system.manufacturer + ' ' + this.state.system.model }</p>
                                <p>{ this.state.osInfo.distro + ' ' + this.state.osInfo.arch }</p>
                                <p className="sub">{this.state.osInfo.release}</p>
                                <p className="sub">{this.state.osInfo.hostname}</p>
                            </div>
                        }
                    </div>
                    {/* Networks Info */}
                    <div className="data-section list">
                        {!this.state.networkInterfaces ?
                            <LoadSpinner userClass="lilBill" /> :
                            <div className="list-data">
                                {this.state.networkInterfaces.filter(function(item) { return !item.internal;}).map((item,i) =>
                                     <div className="list-item" key={i}>
                                        <div className="item-icon"><span>{item.type}</span></div>
                                        <div className="item-info">
                                            <div className="list-title">{item.iface}</div>
                                            <div>{item.ifaceName}</div>
                                            <div className="sub">{item.ip4}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                    </div>

                    {/* CPU Info */}
                    <div className="data-section">
                        {!this.state.cpu ?
                            <LoadSpinner userClass="lilBill" /> :
                            <div className="txt-data">
                                <p>{this.state.cpu.manufacturer + ' ' + this.state.cpu.brand }</p>
                                <p>{this.state.cpu.vendor + ' ' + this.state.cpu.family }</p>
                                <p>{'Cores: ' + this.state.cpu.cores }</p>
                                <p>{'Processors: ' + this.state.cpu.processors }</p>
                            </div>
                        }
                    </div>

                    {/* fsSize Info */}
                    <div className="data-section">
                        {!this.state.fsSize ?
                            <LoadSpinner userClass="lilBill" /> :
                            <div className="chart-data" id="driveGauge"></div>
                        }
                    </div>

                    {/* wifiNetworks Info */}
                    <div className="data-section list">
                        {!this.state.wifiNetworks ?
                            <LoadSpinner userClass="lilBill" /> :
                            <div className="list-data">
                                {this.state.wifiNetworks.map((item,i) =>
                                     <div className="list-item" key={i}>
                                        <div className="item-icon"><span>W</span></div>
                                        <div className="item-info">
                                            <div className="list-title">{item.ssid}</div>
                                            <div>{item.quality}</div>
                                            <div className="sub">{item.security.map((sec,k) =>
                                                <span key={k}>{sec}</span>
                                            )}</div>
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

    componentDidMount(){
        let self = this;
        
        try{    
            self.loadMaps(); 
            ipcRenderer.on('lb-info-reply', self.initRender);
            self.getAllDesktopData();
        }
        catch(ex){
            console.log(" [Little Bill] Error: ", ex);
        }
    }
    
    componentWillUnmount() {
        if (this.view) {
          // destroy the map view
          this.view.container = null;
        }
      }

    loadMaps(){
        //var self = this;
        try {
            setDefaultOptions({ version: '4.7' });

            loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/GraphicsLayer'], { css: true }) 
                .then(([ArcGISMap, MapView, GraphicsLayer]) => {
                    const map = new ArcGISMap({ basemap: 'dark-gray' });
                    
                    this.graphicsLayer = new GraphicsLayer();
                    map.add(this.graphicsLayer);

                    this.view = new MapView({
                        container: this.mapRef.current,
                        map: map,
                        center: [-77.0902091,38.9977548],
                        zoom: 10
                    });
                });
        }
        catch(ex){
            console.log("[Error] Little Bill: ",ex);
        }
    }

    getAllDesktopData(){
        try{
            this.state.sysInfoList.forEach(function(item){
                ipcRenderer.send('lb-info-msg', item);
            });            
        }
        catch(ex){
            console.log(" Error getting desktop data: ", ex)
        }
    }

    initRender(event, arg){  
        var self = this;      
        try {
            self.buildInfoObjects(arg)
        }
        catch(ex){
            console.log(" [Little Bill] Error: ", ex);
        }
    }

    /* Build Data Object */
    buildInfoObjects(data){
        var self = this;

        try {
            if(self.state.sysInfoList.indexOf(data.type) < 0){
                console.log(" [Little Bill] No data to build");
            }
            else {
                this.setState({ [data.type]: data.data },() => {
                    if(data.type == 'fsSize'){
                        self.createGauge(data.data);
                    }                     
                });
            }
        }
        catch(ex){
            console.log(" [Little Bill] Error: ", ex);
        }
    }

    /* Create Gauge */
    createGauge(data){
        try {
            // Create chart instance
            var chart = am4core.create("driveGauge", am4charts.RadarChart);

            chart.data = data.map(function(item,i){
                var tmpVal = 100 * (item.used / item.size);
                return { "category":item.fs, "value":tmpVal.toFixed(0), "full":100};
            });

            // Make chart not full circle
            chart.startAngle = -90;
            chart.endAngle = 180;
            chart.innerRadius = am4core.percent(20);

            // Set number format
            chart.numberFormatter.numberFormat = "#.#'%'";

            // Create axes
            var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.grid.template.strokeOpacity = 0;
            categoryAxis.renderer.labels.template.horizontalCenter = "right";
            categoryAxis.renderer.labels.template.fontWeight = 500;
            categoryAxis.renderer.labels.template.adapter.add("fill", function(fill, target) {
                return (target.dataItem.index >= 0) ? chart.colors.getIndex(target.dataItem.index) : fill;
            });
            categoryAxis.renderer.minGridDistance = 10;

            var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.grid.template.strokeOpacity = 0;
            valueAxis.min = 0;
            valueAxis.max = 100;
            valueAxis.strictMinMax = true;

            // Create series
            var series1 = chart.series.push(new am4charts.RadarColumnSeries());
            series1.dataFields.valueX = "full";
            series1.dataFields.categoryY = "category";
            series1.clustered = false;
            series1.columns.template.fill = new am4core.InterfaceColorSet().getFor("alternativeBackground");
            series1.columns.template.fillOpacity = 0.08;
            series1.columns.template.cornerRadiusTopLeft = 20;
            series1.columns.template.strokeWidth = 0;
            series1.columns.template.radarColumn.cornerRadius = 20;

            var series2 = chart.series.push(new am4charts.RadarColumnSeries());
            series2.dataFields.valueX = "value";
            series2.dataFields.categoryY = "category";
            series2.clustered = false;
            series2.columns.template.strokeWidth = 0;
            series2.columns.template.tooltipText = "{category}: [bold]{value}[/]";
            series2.columns.template.radarColumn.cornerRadius = 20;

            series2.columns.template.adapter.add("fill", function(fill, target) {
                return chart.colors.getIndex(target.dataItem.index);
            });

            // Add cursor
            chart.cursor = new am4charts.RadarCursor();
        }
        catch(ex){
            console.log(" [Little Bill] Error: ", ex);
        }
    }
}

export default LilBill;