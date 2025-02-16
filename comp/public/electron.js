const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load the React app (adjust the URL as needed based on your environment).
  //mainWindow.loadURL('http://localhost:3000');
  mainWindow.loadFile(path.join(__dirname, '../build/index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'win32') {
    app.quit();
  }
});

