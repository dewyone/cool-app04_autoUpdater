const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');
const path = require('path');
const os = require('os-utils');
const fs = require("fs");
const { Console } = require('console');

//** Auto Updater */
const { Menu, protocol } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    // nodeIntegration - To use node.js module in html file
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win = mainWindow;

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));


    // os.cpuUsage(function(v) {
    //     console.log('CPU Usage (%)' + v*100);
    //     console.log('Mem Usage (%)' + os.freememPercentage()*100);
    //     console.log('Total Mem (GB)' + os.totalmem()/1024);
    // });

    setInterval(() => {
        os.cpuUsage(function (v) {
            mainWindow.webContents.send('cpu', v * 100);
            //win.webContents.send("cpu", v*100);
            mainWindow.webContents.send('mem', os.freememPercentage() * 100);
            mainWindow.webContents.send('total-mem', os.totalmem() / 1024);
        });
    }, 1000);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on("toMain", (event, args) => {
    // fs.readFile("path/to/file", (error, data) => {
    //   // Do something with file contents

    //   // Send result back to renderer process
    //   win.webContents.send("fromMain", responseObj);
    // });
});

ipcMain.on("cpu", (event, args) => {
    console.log('From response, CPU Usage (%): ' + args);
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.




//** Auto Updater */
// This is free and unencumbered software released into the public domain.
// See LICENSE for details



//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------
let template = []
if (process.platform === 'darwin') {
    // OS X
    const name = app.getName();
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() { app.quit(); }
            },
        ]
    })
}


//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let updateWin;

function sendStatusToWindow(text) {
    log.info(text);
    updateWin.webContents.send('message', text);
}
function createDefaultWindow() {
    updateWin = new BrowserWindow({
        backgroundColor: "#eeeeee",
        webPreferences: {nodeIntegration: true }
    });
    updateWin.webContents.openDevTools();
    updateWin.on('closed', () => {
        updateWin = null;
    });
    updateWin.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
    return updateWin;
}
autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
});
app.on('ready', function () {
    // Create the Menu
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    createDefaultWindow();
});
app.on('window-all-closed', () => {
    app.quit();
});

//
// CHOOSE one of the following options for Auto updates
//

//-------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
//-------------------------------------------------------------------
app.on('ready', function () {
    autoUpdater.checkForUpdatesAndNotify();
});

//-------------------------------------------------------------------
// Auto updates - Option 2 - More control
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
// autoUpdater.on('update-downloaded', (info) => {
//   autoUpdater.quitAndInstall();  
// })
