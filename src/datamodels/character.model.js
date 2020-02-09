
class characterModel {
    constructor(myName, myBody, myDesc, networkStatus){
        this.name = myName;        
        this.colorClass = myName+"_theme";
        this.description = myDesc;        
        this.bodyComponent = myBody;
        this.networkStatus = networkStatus;
    }
}

export default characterModel;