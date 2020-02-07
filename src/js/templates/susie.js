import React, { Component } from 'react';

/* Components */
import SocketConnect from './components/socketConnect';
import LoadSpinner from './components/loadSpinner';

var localSock = null;

const { desktopCapturer } = window.require('electron');

class Susie extends Component{
    constructor(props) {
        super(props);

        this.state = {
            mainSrc: null,
            sourceList:[],
            filterList:[
                {filter: "edgeDetect", title: "Edge Detection" },
                {filter: "faceMark", title: "Face Mark" },
                {filter: "faceRecognition", title: "Face Recognition" }
            ],
            toggleSrc: false,
            toggleFilters:false,
            videoFilter: 'live',
            susieLoading:false,
            imgObj:null
        }

        this.liveVideo = null;
        this.liveSnapshot = null;

        this.toggleLiveVideo = this.toggleLiveVideo.bind(this);
        this.changeVideoSrc = this.changeVideoSrc.bind(this);
        this.toggleSnapShot = this.toggleSnapShot.bind(this);
        this.socketDeclaration = this.socketDeclaration.bind(this);
    }
   
    render(){        
        return(
            <div className="page-container susie-page">
                {/* <SocketConnect baseUrl={this.props.jConnect.coreUrlBase} user={this.props.jUser} socketDeclaration={this.socketDeclaration}/> */}
                <div className="pageBack"><span className="back-icon">S</span></div>
                <div className="susie-ctrl">
                    <div className="src-ctrl" onClick={() => this.toggleLiveVideo(false, true)}><div className="ctrl-btn" /></div>
                    { this.liveVideo && <div className="src-ctrl" onClick={() => this.setState({ toggleSrc: !this.state.toggleSrc })}><div className="ctrl-sbtn" /></div> }
                    { this.liveVideo && <div className="src-ctrl" onClick={() => this.setState({ toggleFilters: !this.state.toggleFilters })}><div className="ctrl-fbtn" /></div> }

                    {this.state.toggleSrc && 
                        <div className="sourceList">
                            <div className="src-container">
                                {this.state.sourceList.map((item,i)=>
                                    <div className="srcPill" key={i} onClick={() => this.changeVideoSrc(item)}>{item.name}</div>
                                )}   
                            </div>
                        </div>
                    }
                </div>

                <div className="susie-view"> 
                    {this.state.susieLoading && <LoadSpinner userClass="susie" />}                     
                    <video id="video" className={(this.state.videoFilter === 'live'? "active": "inactive")}></video>      
                    <img id="filterVideo" className={(this.state.videoFilter !== 'live'? "active": "inactive")} alt="Susie filtered video" src=""></img>                  
                </div>

                {this.liveVideo && this.state.toggleFilters && 
                    <div className="filter-ctrl">
                         {this.state.filterList.map((item,i)=> 
                            <div className="filter-item" key={i} onClick={() => this.toggleSnapShot(item.filter)}>
                                <div>{item.title}</div>
                            </div>                          
                         )}
                    </div>
                }
            </div>
        );        
    }

    componentDidMount(){
        let self = this;    

        try {
            desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
                navigator.mediaDevices.enumerateDevices().then(function(devices) {
                    var videoList = devices.filter(function(item){ return item.kind == "videoinput";}).map(function(device){
                        return {"id":device.deviceId, "name": device.label, "type":"deviceId" };
                    });

                    if(sources && videoList) { sources = videoList.concat(sources); }
                    self.setState({ sourceList: sources });
                });                
            });
            
            this.socketDeclaration(this.props.localSock);
        }  
        catch(ex){
            console.log(" [Susie] Error: ", ex);
        }
    }

     /* Start Main Video */
     toggleLiveVideo(audioSettings, videoSettings){
        var self = this;
        try{
            if(self.liveVideo == null || !self.liveVideo.getSettings().frameRate) {
                self.setState({ videoFilter: "live", mainSrc: "live", susieLoading: true });
                videoSettings = ( videoSettings == true ? { facingMode: "user" } : videoSettings);

                navigator.mediaDevices.getUserMedia({
                    audio: audioSettings,
                    video: videoSettings
                })
                .then((stream) => {
                    const video = document.querySelector('video');
                    video.srcObject = stream;
                    self.liveVideo = stream.getTracks()[0];
                    video.onloadedmetadata = (e) => video.play(); 

                    self.setState({ susieLoading: false });
                })
                .catch((e) => {console.log(e);})
            }
            else {
                self.liveVideo.stop();
                self.liveVideo = null;

                clearInterval(self.liveSnapshot);
                self.liveSnapshot = null;
                //const video = document.querySelector('video');
                //video.srcObject = null;
                document.querySelector('video').srcObject = null;                
                self.setState({ mainSrc: null, toggleSrc: false, toggleFilters:false });
            }
        }
        catch(ex){
            console.log(" [Phoebe] Error starting video: ", ex);
        }
    }

    /* Change Video Src */
    changeVideoSrc(newSrc){
        var self = this;
        var filterStatus = (self.state.videoFilter !== 'live');

        try {            
            // stop live video
            self.liveVideo.stop();
            clearInterval(self.liveSnapshot);

            // update video src
            self.state.mainSrc = newSrc.name;
            
            // toggle live with new src
            var videoSrc = (newSrc && newSrc.name === "live" ? 
                                true : 
                                (newSrc.type && newSrc.type == "deviceId" ? 
                                    {deviceId: newSrc.id} :
                                    {mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: newSrc.id}}
                                )
                            );
            self.toggleLiveVideo(false, videoSrc);

            // if filter was on re-enable
            //if(filterStatus) { self.toggleSnapShot(self.state.videoFilter); }
        }
        catch(ex){
            console.log(" [Phoebe] changing src error: ", ex);
        }
    }

    /* Toggle Snap Shot Type */
    toggleSnapShot(filter){
        var self = this;
        try {
            if(self.liveSnapshot != null){ 
                clearInterval(self.liveSnapshot);
                self.liveSnapshot = null;
                
                if(filter === self.state.videoFilter){
                    self.setState({ videoFilter: 'live' });
                }
                else {
                    self.toggleSnapShot(filter);
                }
            }
            else {
                if(filter != null){
                    this.setState({ videoFilter: filter });
                    self.liveSnapshot = setInterval(function() { 
                        var tmpSnapShot = self.getSnapShot();                        
                        // Send Snap to Jada
                        var dataMsg = {
                            "rId":self.props.jUser.userId, 
                            "command":"susieView", "filter":filter, 
                            "filterStatus":true, "data":tmpSnapShot
                        };                        
                        localSock.emit('direct connection', {"sID":self.props.jUser.userId, "data":dataMsg});
                    }, 180);
                }
            }
        }
        catch(ex){
            console.log(" [Susie] Error toggling video snapshot: ", ex);
        }
    }

    /* Get Snapshot of main video */
    getSnapShot(){
        var ret = null;

        try {
            var video = document.querySelector('video'), shrinkSz = .5, canvas, context;
            if(video) {
                var width = video.offsetWidth * shrinkSz, height = video.offsetHeight * shrinkSz;

                canvas = canvas || document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, width, height);

                ret = canvas.toDataURL('image/png');
            }
        }
        catch(ex){
            console.log(" [Susie] Error getting video snapshot: ", ex);
        }

        return ret;
    }

    /* Socket */   
    socketDeclaration(tmpSock){
        var self = this;
        try {
            self.state.imgObj = document.getElementById("filterVideo");

            tmpSock.on('direct connection',function(res) {
                if(self.state.imgObj) {
                    self.state.imgObj.src = res.data;
                }
            });
            localSock = tmpSock;
        }
        catch(ex){
            console.log("Error with socket declaration: ", ex);
        }
    }
}

export default Susie;