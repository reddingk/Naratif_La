import React, { Component } from 'react';
import { gsap, Draggable } from "gsap/all";

/* Variables */
var nextUid = 0;
var portLookup = {};
var connectorLookup = {};
var ports = [];
var shapes = [];
var connectorPool = [];
var connectionList = {};
var connectionOrder = [];
var shapeLookup = {};

class Access extends Component{
    constructor(props) {
        super(props);
        this.diagram = null;
        this.state = {
            keyMax: "|||||||||"
        }
    }
   
    render(){        
        return(
            <div className="main-body access">
                <div className="body-container main-access">
                    <div className="page-container">
                        <div className="access-pad">
                            <svg id="svg">
                                <g id="diagram" data-drag="diagram:diagram" data-drag-type="diagram">
                                    {/*Node Layer */}
                                    <g className="node-layer" id="node-layer">
                                        {/* Point */}
                                        {this.state.keyMax.split('').map((item,i) => 
                                            <g className="node-container" data-jid={this.state.keyMax.length - i}>
                                                <g className="input-point">
                                                    <g className="input-field" transform="translate(0, 50)">
                                                        <g className="port">
                                                        <circle className="port-outer" cx="50" cy="50" r="40" />
                                                        <circle className="port-inner" cx="50" cy="50" r="15" />
                                                        <circle className="port-scrim" cx="50" cy="50" r="40" />
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        )}
                                    </g>

                                    {/* Connection Layer */}
                                    <g id="connections-layer" />
                                    <g className="connector">          
                                        <path className="connector-path-outline" />
                                        <path className="connector-path" />
                                
                                        <circle className="connector-handle input-handle" cx="0" cy="0" r="4" />
                                        <circle className="connector-handle output-handle" cx="0" cy="0" r="4" />
                                    </g>

                                    {/* Drag Proxy */}
                                    <circle id="drag-proxy" cx="0" cy="0" r="1" fill="none" /> 
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );        
    }

    componentDidMount(){
        nextUid = 0;
        portLookup = {};
        connectorLookup = {};
        ports = [];
        shapes = [];
        connectorPool = [];
        connectionList = {};
        connectionOrder = [];
        this.diagram = new Diagram();

        SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(toElement) {
            return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());  
        };
    }
}

export default Access;

/*** Diagram ***/
class Diagram {
    constructor() {
      this.dragElement = this.element = document.querySelector("#diagram");
      const shapeElements = Array.from(document.querySelectorAll(".node-container"));

      shapeElements.forEach((element, i) => {  
        var xLoc = (i%3) * 150;
        var yLoc = parseInt(i/3) * 150;   
        const shape = new NodeShape(element, xLoc, yLoc);      
        shapeLookup[shape.id] = shape;
        shapes.push(shape);
      });
  
      this.target = null;
      this.dragType = null;
  
      this.dragTarget = this.dragTarget.bind(this);
      this.prepareTarget = this.prepareTarget.bind(this);
      this.stopDragging = this.stopDragging.bind(this);
    }
  
    stopDragging() {}
  
    prepareTarget(event) {}
  
    dragTarget() { }
}

/*** NODE SHAPE ***/
class NodeShape {
    constructor(element, x, y) {
      this.id = `shape_${++nextUid}`;
      this.dragType = "shape";
  
      element.setAttribute("data-drag", `${this.id}:shape`);
      this.element = element;    
      this.dragElement = element;
      this.jid = element.dataset.jid;
        
      gsap.set(element, { x, y }); 
  
      // Set Port
      const inputElements = element.querySelector(".input-field"); 
      const port = new NodePort(this, inputElements, this.jid);
      portLookup[port.id] = port;
      ports.push(port);
      this.inputs = port;        
    }
}

/*** NODE PORT ***/
class NodePort {
    constructor(parentNode, element, jid) {
      const svg = document.querySelector("#svg");

      this.id = `port_${++nextUid}`;
      this.dragType = "port";
            
      this.parentNode = parentNode;    
        
      this.element = element;
      this.jid = jid;
      this.portElement = element.querySelector(".port");
      this.portScrim = element.querySelector(".port-scrim");
        
      this.portScrim.setAttribute("data-drag", `${this.id}:port`);
        
      this.connectors = [];
      this.lastConnector = null;
        
      const bbox = this.portElement.getBBox();
        
      this.global = svg.createSVGPoint();        
      this.center = svg.createSVGPoint();
      this.center.x = bbox.x + bbox.width / 2;
      this.center.y = bbox.y + bbox.height / 2;
            
      this.update();
    }
  
    createConnector() { }
  
    removeConnector(connection) {}
    
    addConnector(connection) {}
        
    update() {  }
  }

  /*** CONNECTOR ***/
class Connector {
    constructor() {      
      const frag = document.createDocumentFragment();
      frag.appendChild(document.querySelector(".connector"));
      const connectorElement = frag.querySelector(".connector");

      this.id = `connector_${++nextUid}`;
      this.dragType = "connector";    
      this.isSelected = false;    
      this.element = connectorElement.cloneNode(true);
      this.path = this.element.querySelector(".connector-path");
      this.pathOutline = this.element.querySelector(".connector-path-outline");
      this.inputHandle = this.element.querySelector(".input-handle");
      this.outputHandle = this.element.querySelector(".output-handle");
    }
  
    init(port) { }
  
    updatePath() { }
  
    updateHandle(port) {  }
  
    placeHandle() {  }
  
    remove() { }
    
    onDrag() { }
    
    onDragEnd() {}
  
  }