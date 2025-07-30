import { app, shell, BrowserWindow, ipcMain, Tray, Menu,nativeImage,dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset';

import { initializeDatabase } from './database';
import { registerIpcHandlers } from './ipcHandlers';
import { startTracking,getCurrentActiveGoal } from './services/trackingService'

let mainWindow;
let isQuitting = false;
let tray;
let capsuleWindow;
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false, 
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation:true
    }
  })
  
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('close', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    mainWindow.hide();
  }
});
 mainWindow.on('minimize', () => {
  
    if (capsuleWindow && getCurrentActiveGoal()) {
      capsuleWindow.show();
    }
  });
  mainWindow.on('restore', () => {
  if (capsuleWindow) {
    capsuleWindow.hide();
  }
});

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createCapsuleWindow(){
  capsuleWindow = new BrowserWindow({
    width: 300,
    height: 80,
    frame: false,      // No window frame (title bar, etc.)
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    show:false, // Doesn't show up in the taskbar
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation:true
    }
  });

  // Load a separate HTML file or a specific route for the capsule
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    capsuleWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/capsule.html`);
  } else {
    capsuleWindow.loadFile(join(__dirname, '../renderer/capsule.html'));
  }

  // Hide it by default
  capsuleWindow.hide();
  // capsuleWindow.webContents.openDevTools();
  capsuleWindow.setAlwaysOnTop(true,"screen");

  

}


function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  const contextMenu = Menu.buildFromTemplate([
    {label:'Show App', click: () => mainWindow.show()},
    {label:'quit',click:() => {
      isQuitting = true;
      app.quit();
    }}
  ]);
  tray.setToolTip('App Usage Tracker');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  initializeDatabase();
  startTracking();
  registerIpcHandlers();

  createTray();
  createWindow();
  createCapsuleWindow();
  

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  ipcMain.on('quit-app', () => {
    capsuleWindow.hide();
  })




  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
      
  })
})
function updateCapsuleData(goalName, timeSpent) {
  if (capsuleWindow) {
    capsuleWindow.webContents.send('update-capsule-data', { goalName, timeSpent });
  }
}
export{updateCapsuleData}

