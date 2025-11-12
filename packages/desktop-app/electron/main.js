const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let mainWindow;

// Load configuration from config.json if it exists
function loadConfig() {
  const configPath = path.join(__dirname, '../config.json');
  const exampleConfigPath = path.join(__dirname, '../config.example.json');
  
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } else if (fs.existsSync(exampleConfigPath)) {
      console.log('config.json not found, using config.example.json');
      const configData = fs.readFileSync(exampleConfigPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  
  return {};
}

// Get API URL from environment or config
function getApiUrl() {
  const config = loadConfig();
  
  // Priority: .env > config.json > default
  return process.env.API_BASE_URL || 
         config.apiBaseUrl || 
         'http://localhost:3000';
}

// Get environment setting
function getEnvironment() {
  const config = loadConfig();
  
  return process.env.ENVIRONMENT || 
         config.environment || 
         'production';
}

function createWindow() {
  const apiUrl = getApiUrl();
  const environment = getEnvironment();
  
  console.log('Starting YektaYar Desktop App');
  console.log('Environment:', environment);
  console.log('API Base URL:', apiUrl);
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../build/icon.png')
  });

  // Determine the path to the web content
  // In production (packaged app), files are in resources/app
  // In development, we need to check multiple possible locations
  let indexPath;
  
  if (app.isPackaged) {
    // Production: Look in the app's resources
    indexPath = path.join(process.resourcesPath, 'app', 'build', 'index.html');
  } else {
    // Development: Try multiple locations
    const devPaths = [
      path.join(__dirname, '../build/index.html'),
      path.join(__dirname, '../../admin-panel/dist/index.html')
    ];
    
    indexPath = devPaths.find(p => fs.existsSync(p));
  }
  
  if (indexPath && fs.existsSync(indexPath)) {
    // Load the built admin panel
    console.log('Loading app from:', indexPath);
    mainWindow.loadFile(indexPath);
  } else {
    // Development mode - load from dev server
    console.log('Loading from dev server: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
  }

  // Open DevTools in development
  if (environment === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Pass configuration to renderer process
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-config', {
      apiBaseUrl: apiUrl,
      environment: environment
    });
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
