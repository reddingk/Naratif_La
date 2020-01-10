import React, { Component } from 'react';
import { loadModules, setDefaultOptions } from 'esri-loader';

/* Components */
import LoadSpinner from './components/loadSpinner';

class RooseveltFranklin extends Component{
    constructor(props) {
        super(props);

        this.state = {
            zoomTool: null
        }

        this.mapRef = React.createRef();

        this.mapZoom = this.mapZoom.bind(this);
    }
   
    render(){        
        return(
            <div className="page-container rooseveltFranklin-page">
                <div className="map-ctrl">
                    <div className="ctrl-item">
                        <div class="zoom in" onClick={() => this.mapZoom("zoomin")} />
                        <div class="zoom out"  onClick={() => this.mapZoom("zoomout")} />
                    </div>
                </div>
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

            loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/GraphicsLayer', 'esri/core/watchUtils','esri/widgets/Zoom/ZoomViewModel'], { css: true }) 
                .then(([ArcGISMap, MapView, GraphicsLayer, watchUtils, ZoomViewModel]) => {
                    const map = new ArcGISMap({ basemap: 'dark-gray' });
                    
                    this.graphicsLayer = new GraphicsLayer();
                    map.add(this.graphicsLayer);

                    this.view = new MapView({
                        container: this.mapRef.current,
                        map: map, center: [-77.0902091,38.9977548],
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