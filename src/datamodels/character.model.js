
class characterModel {
    constructor(myName, myNav, myBody, myDesc){
        this.name = myName;        
        this.colorClass = myName+"_theme";
        this.description = myDesc;
        this.navComponent = myNav;
        this.bodyComponent = myBody;
    }
}

export default characterModel;