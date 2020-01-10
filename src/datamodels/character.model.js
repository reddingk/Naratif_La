
class characterModel {
    constructor(myName, myBody, myDesc){
        this.name = myName;        
        this.colorClass = myName+"_theme";
        this.description = myDesc;        
        this.bodyComponent = myBody;
    }
}

export default characterModel;