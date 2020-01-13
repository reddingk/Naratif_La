import React, { Component } from 'react';
import { loadModules, setDefaultOptions } from 'esri-loader';
import ResizePanel from "react-resize-panel";

/* Components */
import LoadSpinner from './components/loadSpinner';

class RooseveltFranklin extends Component{
    constructor(props) {
        super(props);

        this.state = {
            zoomTool: null,
            layers:[
                {title:"US Weather Map", visible:false, link:"https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer"},
                {title:"World Countries", visible:false, link:"https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer"},
                {title:"US Airports", visible:false, link:"https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer"},
                {title:"US Universities", visible:false, link:"https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/Colleges_and_Universities_(USDED)/FeatureServer"}
            ]
        }

        this.mapRef = React.createRef();

        this.mapZoom = this.mapZoom.bind(this);
    }
   
    render(){        
        return(
            <div className="page-container rooseveltFranklin-page">
                <ResizePanel direction="e">
                    <div className="map-ctrl">
                        <div className="ctrl-item">
                            <div class="zoom in" onClick={() => this.mapZoom("zoomin")} />
                            <div class="zoom out"  onClick={() => this.mapZoom("zoomout")} />
                        </div>
                        <div className="ctrl-item area">
                            {this.state.layers.map((item, i) => 
                               <div className={"layer-item" + (item.visible ? " active":"")} key={i} onClick={()=> this.toggleLayer(i) }>
                                   <span>{item.title}</span>
                                   <div className="layer-toggle"/>
                               </div> 
                            )}
                        </div>
                    </div>
                </ResizePanel>
                <div className="arcMap" ref={ this.mapRef } />
            </div>
        );        
    }

    componentDidMount(){
        let self = this;
        
        try{    
            self.loadMaps();             
        }
        catch(ex){
            console.log(" [Roosevelt Franklin] Error: ", ex);
        }
    }

    componentWillUnmount() {
        if (this.view) {
          // destroy the map view
          this.view.container = null;
        }
    }

    /* Load Map */
    loadMaps(){
        var self = this;
        try {
            setDefaultOptions({ version: '4.7' });

            loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/GraphicsLayer', 'esri/widgets/Zoom/ZoomViewModel'], { css: true }) 
                .then(([ArcGISMap, MapView, GraphicsLayer, ZoomViewModel]) => {
                    this.map = new ArcGISMap({ basemap: 'dark-gray' });
                    
                    this.graphicsLayer = new GraphicsLayer();
                    this.map.add(this.graphicsLayer);

                    this.view = new MapView({
                        container: this.mapRef.current,
                        map: this.map, center: [-77.0902091,38.9977548],
                        zoom: 10, ui: { components: ["attribution"] }
                    });                  
                                        
                    this.view.when(function(){
                        self.setState({ zoomTool: new ZoomViewModel() }, ()=>{
                            self.state.zoomTool.view = self.view;
                        });
                    });
                });
        }
        catch(ex){
            console.log("[Roosevelt Franklin] Error: ",ex);
        }
    }

    /* Toggle Layer */
    toggleLayer(layerid){
        var self = this;
        try {
            var tmpLayerList = this.state.layers;
            var layerOn = tmpLayerList[layerid].visible;
            loadModules(['esri/layers/FeatureLayer'], { css: true }) 
                .then(([FeatureLayer]) => {
                    tmpLayerList[layerid].visible = !tmpLayerList[layerid].visible;
                    self.setState({ layers: tmpLayerList }, () => {
                        if(!layerOn) {
                            var featureLayer = new FeatureLayer({ title: tmpLayerList[layerid].title, url: tmpLayerList[layerid].link });
                            self.map.add(featureLayer);
                        }
                        else {
                            var foundLayer = self.map.allLayers.find(function(layer) {
                                return layer.title === tmpLayerList[layerid].title;
                            });
                            self.map.remove(foundLayer);
                        }
                    });
                });
        }
        catch(ex){
            console.log("[Roosevelt Franklin] Error toggling layer: ",ex);
        }
    }

    /* Zoom */
    mapZoom(type){
        try {
            if(type == 'zoomin'){
                this.state.zoomTool.zoomIn();
            }
            else {
                this.state.zoomTool.zoomOut();
            }
        }
        catch(ex){
            console.log("[Roosevelt Franklin] Zoom Error: ",ex);
        }
    }
}

export default RooseveltFranklin;