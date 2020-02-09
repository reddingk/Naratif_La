const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');
const isDev = require('electron-is-dev');
var si = require('systeminformation');
const storage = require('electron-json-storage');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 1100, height: 800, webPreferences: { nodeIntegration: true, webSecurity: false }});
    
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  
    mainWindow.on('closed', () => mainWindow = null);    
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/* Update User Data */
ipcMain.on('naratif-update-usr', (event, arg) => {  
  try {
    var userInfo = (arg ? arg : null);

    if(userInfo){
      storage.set('naratifUsr', userInfo, function(error) {
        if (error) throw error;
        event.sender.send('naratif-update-usr-status', {"status":true });
      });
    }
  } catch(ex){
    event.sender.send('naratif-update-usr-status', {"status":false, "error":ex });
  }
});

/* Get User Data */
ipcMain.on('naratif-get-usr', (event, arg) => {  
  try {
    storage.get('naratifUsr', function(error, data) {
      if (error) throw error;
     
      event.sender.send('naratif-get-usr-status', {"status":true, "user":data });
    });
  } catch(ex){
    event.sender.send('naratif-update-usr-status', {"status":false, "error":ex });
  }
});

/* Render Processes */
ipcMain.on('lb-info-msg', (event, arg) => {  
  var systype = (arg ? arg : null);
    
  switch(systype){
    case 'all':
      si.getAllData(function(data) { event.sender.send('lb-info-reply', {"type":"all", "data":data}); });
      break;
    case 'cpu':    
      si.cpu(function(data) { event.sender.send('lb-info-reply', {"type":"cpu", "data":data}); });
      break;   
    case 'networkInterfaces':    
      si.networkInterfaces(function(data) { event.sender.send('lb-info-reply', {"type":"networkInterfaces", "data":data}); });
      break;        
    case 'mem':    
      si.mem(function(data) { event.sender.send('lb-info-reply', {"type":"mem", "data":data}); });
      break;   
    case 'fsSize':    
      si.fsSize(function(data) { event.sender.send('lb-info-reply', {"type":"fsSize", "data":data}); });
      break;   
    case 'battery':    
      si.battery(function(data) { event.sender.send('lb-info-reply', {"type":"battery", "data":data}); });
      break;   
    case 'system':    
      si.system(function(data) { event.sender.send('lb-info-reply', {"type":"system", "data":data}); });
      break;   
    case 'osInfo':    
      si.osInfo(function(data) { event.sender.send('lb-info-reply', {"type":"osInfo", "data":data}); });
      break;   
    case 'wifiNetworks':    
      si.wifiNetworks(function(data) { event.sender.send('lb-info-reply', {"type":"wifiNetworks", "data":data.sort(function(a,b){ return b.quality - a.quality;})}); });
      break;   
    default:
      event.sender.send('lb-info-reply', {"error":"No Data [1]"});
      break;
  }
});
