import React, { Component } from 'react';
import { TweenLite } from "gsap";
import Draggable from "gsap/Draggable";

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

var frag = null;
var connectorElement = null;
var dragProxy = null;
var svg = null;
var connectorLayer = null;
var shapeElements = null;

class AccessPad extends Component{
    constructor(props) {
        super(props);
        this.diagram = null;
        this.state = {
            keyMax: "|||||||||",
            connectorList:[]
        }

        this.btnIsSelected = this.btnIsSelected.bind(this);
        this.dropCallback = this.dropCallback.bind(this);
        this.clearPin = this.clearPin.bind(this);
        this.submit = this.submit.bind(this);
    }
   
    render(){        
        return(         
            <div>
                <div className="access-container">
                    <div className="access-pad">
                        <svg id="svg">
                            <g id="diagram" data-drag="diagram:diagram" data-drag-type="diagram">
                                {/*Node Layer */}
                                <g className="node-layer" id="node-layer">
                                    {/* Point */}
                                    {this.state.keyMax.split('').map((item, i) =>
                                        <g className="node-container" data-jid={this.state.keyMax.length - i} key={this.state.keyMax.length - i}>
                                            <g className="input-point">
                                                <g className="input-field" transform="translate(0, 50)">
                                                    <g className={"port" + (this.btnIsSelected(this.state.keyMax.length - i) ? " sel" : "")}>
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

                <div className="btn-container">
                    <div className="btn reverse" onClick={this.clearPin}>Clear</div>
                    <div className="btn" onClick={this.submit}>Login</div>
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
        /* Declerations */
        frag = document.createDocumentFragment();
        frag.appendChild(document.querySelector(".connector"));
        connectorElement = frag.querySelector(".connector");
        dragProxy = document.querySelector("#drag-proxy");
        svg = document.querySelector("#svg");
        connectorLayer = document.querySelector("#connections-layer");
        shapeElements = Array.from(document.querySelectorAll(".node-container"));
        /* Start Diagram */
        this.diagram = new Diagram(this.dropCallback);
    }

    btnIsSelected(id){
        var idStr = this.state.connectorList.join(".");
        return (idStr.indexOf(id) >= 0);
    }

    dropCallback(data){
        this.setState({ connectorList: data });
    }

    clearPin(){
        try {
            this.setState({ connectorList: [] }, () =>{
                this.componentDidMount();
                //Clear visual connectors
                var e = document.querySelector("#connections-layer"); 
                e.innerHTML = "";
            });
        }
        catch(ex){
            console.log(" [Error] Clearing Pin", ex);
        }
    }

    submit(){
        try {
            this.props.submitKey(this.state.connectorList);
        }
        catch(ex){
            console.log(" [Error] with submission", ex);
        }
    }
}

export default AccessPad;

/*** KEY PAD JS ***/
SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(toElement) {
    return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());  
};

/*** Diagram ***/
class Diagram {
    constructor(callback) {
      this.dragElement = this.element = document.querySelector("#diagram");

      shapeElements.forEach((element, i) => {  
        var xLoc = (i%3) * 150;
        var yLoc = parseInt(i/3) * 150;   
        const shape = new NodeShape(element, xLoc, yLoc, callback);      
        shapeLookup[shape.id] = shape;
        shapes.push(shape);
      });
  
      this.target = null;
      this.dragType = null;
  
      this.dragTarget = this.dragTarget.bind(this);
      this.prepareTarget = this.prepareTarget.bind(this);
      this.stopDragging = this.stopDragging.bind(this);

      this.draggable = new Draggable(dragProxy, {
        allowContextMenu: true,
        trigger: svg,
        onDrag: this.dragTarget,
        onDragEnd: this.stopDragging,
        onPress: this.prepareTarget,
      });
    }
  
    stopDragging() { 
        if(this.target != null) { 
            this.target.onDragEnd && this.target.onDragEnd(); 
        }
    }
  
    prepareTarget(event) {
        let element = event.target;
        let drag;

        while (!(drag = element.getAttribute("data-drag")) && element !== svg) {
          element = element.parentNode;
        }
    
        drag = drag || "diagram:diagram";
        const split = drag.split(":");
        const id = split[0];
        const dragType = split[1];
    
        switch (dragType) {
          case "diagram":
            this.target = null;
            break;
            
          case "shape":
            this.target = shapeLookup[id];
            break;
            
          case "port":
            const port = portLookup[id];
            port.createConnector();
            this.target = port.lastConnector;
            this.dragType = this.target.dragType;
            break;
            
          case "connector":
            this.target = connectorLookup[id];
            break;
        }
    }
    
    dragTarget() {   
        if(this.target != null){   
            TweenLite.set(this.target.dragElement, {
            x: `+=${this.draggable.deltaX}`,
            y: `+=${this.draggable.deltaY}`,
            });
            
            this.target.onDrag && this.target.onDrag();
        }
    }
}

/*** NODE SHAPE ***/
class NodeShape {
    constructor(element, x, y, callback) {
      this.id = `shape_${++nextUid}`;
      this.dragType = "shape";
  
      element.setAttribute("data-drag", `${this.id}:shape`);
      this.element = element;    
      this.dragElement = element;
      this.jid = element.dataset.jid;
        
      TweenLite.set(element, { x, y }); 
  
      // Set Port
      const inputElements = element.querySelector(".input-field"); 
      const port = new NodePort(this, inputElements, this.jid, callback);
      portLookup[port.id] = port;
      ports.push(port);
      this.inputs = port;        
    }
}

/*** NODE PORT ***/
class NodePort {
    constructor(parentNode, element, jid, callback) {
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
      
      this.callback = callback;
      this.update();
    }
  
    createConnector() { 
        let connector;
    
        if (connectorPool.length) {
            connector = connectorPool.pop();
            connectorLookup[connector.id] = connector;
        } else {
            connector = new Connector();  
        }
        
        connector.init(this);
        this.lastConnector = connector;
        this.connectors.push(connector);
    }
  
    removeConnector(connection) {
        const index = this.connectors.indexOf(connection);
    
        if (index > -1) {
            this.connectors.splice(index, 1);
        }
    }
    
    addConnector(connection) { this.connectors.push(connection); }
        
    update() {  
        const diagramElement = document.querySelector("#diagram");
        const transform = this.portElement.getTransformToElement(diagramElement);
        this.global = this.center.matrixTransform(transform);
        
        for (let connector of this.connectors) {
            connector.updateHandle(this);
        }
    }
  }

  /*** CONNECTOR ***/
class Connector {
    constructor() {      
      this.id = `connector_${++nextUid}`;
      this.dragType = "connector";    
      this.isSelected = false;    
      this.element = connectorElement.cloneNode(true);
      this.path = this.element.querySelector(".connector-path");
      this.pathOutline = this.element.querySelector(".connector-path-outline");
      this.inputHandle = this.element.querySelector(".input-handle");
      this.outputHandle = this.element.querySelector(".output-handle");
    }
  
    init(port) { 
        connectorLayer.appendChild(this.element);       

        this.inputPort = port;    
        this.callback = port.callback;  
        this.dragElement = this.outputHandle;
        this.staticElement = this.inputHandle;
        this.startPth = port.jid;    
        
        this.staticPort = port;    
        this.dragElement.setAttribute("data-drag", `${this.id}:connector`);
        this.staticElement.setAttribute("data-drag", `${port.id}:port`);       
        
        TweenLite.set([this.inputHandle, this.outputHandle], {
            x: port.global.x,
            y: port.global.y
        }); 
    }
  
    updatePath() {
        const x1 = this.inputHandle._gsTransform.x;
        const y1 = this.inputHandle._gsTransform.y;
        
        const x4 = this.outputHandle._gsTransform.x;
        const y4 = this.outputHandle._gsTransform.y;
        
        const dx = 0;
        
        const p1x = x1;
        const p1y = y1;
        
        const p2x = x1 - dx;
        const p2y = y1;
            
        const p4x = x4;
        const p4y = y4;
        
        const p3x = x4 + dx;
        const p3y = y4;
        
        const data = `M${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y}`;
        
        this.path.setAttribute("d", data);
        this.pathOutline.setAttribute("d", data);
    }
  
    updateHandle(port) { this.updatePath();  }
  
    placeHandle() { 
        const skipShape = this.staticPort.parentNode.element;    
        let hitPort;   

        for (let shape of shapes) {      
            if (shape.element === skipShape) { continue;  }
            
            if (Draggable.hitTest(this.dragElement, shape.element)) {        
                const ports = shape.inputs        
                        
                if (Draggable.hitTest(this.dragElement, ports.portElement)) {
                    hitPort = ports;
                    break;
                }                
            }
        }   

        if (hitPort) {     
            this.endPth = hitPort.jid;
            var connKey = this.startPth + "|" + this.endPth;

            var lastKey = (connectionOrder.length > 0 ? connectionOrder[connectionOrder.length-1] : null);
            var isSequential = connectionOrder.length == 0 || (this.startPth == connectionList[lastKey].endPth);

            if(!connectionList[connKey] && isSequential) {        
                connectionList[connKey] = this;
                connectionOrder.push(connKey);

                this.inputPort = hitPort;     
                this.dragElement.setAttribute("data-drag", `${hitPort.id}:port`);      
                hitPort.addConnector(this);
                this.updateHandle(hitPort);
                this.callback(connectionOrder);
            }
            else {
                this.remove();
            }      
        } else {
            this.remove();
        }
    }
  
    remove() {
        if (this.inputPort) {
            this.inputPort.removeConnector(this);
        }
        
        if (this.outputPort) {
            this.outputPort.removeConnector(this);
        }
        
        this.isSelected = false;
        
        this.path.removeAttribute("d");
        this.pathOutline.removeAttribute("d");
        this.dragElement.removeAttribute("data-drag");
        this.staticElement.removeAttribute("data-drag");     
        
        this.staticPort = null;    
        this.inputPort = null;
        this.outputPort = null;
        this.dragElement = null;
        this.staticElement = null;

        connectorLayer.removeChild(this.element);
        connectorPool.push(this);
    }
    
    onDrag() { this.updatePath(); }
    
    onDragEnd() { this.placeHandle(); }  
  }