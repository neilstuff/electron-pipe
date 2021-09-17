'use strict';

//handle setupevents as quickly as possible
const config = require('./config.json');

const { app, protocol, dialog, ipcMain, BrowserWindow } = require('electron');
const os = require('os');
const path = require('path')
const url = require('url')

var mainWindow = null;

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1480,
        height: 944,
        resizable: true,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js")
        }

    });

    if (config.mode == "debug") {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.setMenu(null);
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', () => {
        mainWindow = null
    })

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('quit', function(event, arg) {

    app.quit();

});

ipcMain.on('minimize', function(event, arg) {

    mainWindow.minimize();


});

ipcMain.on('isMaximized', function(event, arg) {

    event.returnValue = mainWindow.isMaximized();

});

ipcMain.on('maximize', function(event, arg) {

    mainWindow.maximize();

});

ipcMain.on('unmaximize', function(event, arg) {

    mainWindow.unmaximize();

});

ipcMain.on('showSaveDialog', async function(event, arg) {
    var filename = arg;
    var result = await dialog.showSaveDialog({
            defaultPath: filename,
            properties: [
                { createDirectory: true }
            ],
            filters: [
                { name: 'zip', extensions: ['zip'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        }

    );

    event.returnValue = result;

});

ipcMain.on('showOpenDialog', async function(event, arg) {
    var result = await dialog.showOpenDialog(os.type() == 'Windows_NT' ? {
        properties: ['createDirectory'],
        filters: [
            { name: 'zip', extensions: ['zip'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    } : {
        properties: ['openFile', 'openDirectory', 'createDirectory'],
        filters: [
            { name: 'zip', extensions: ['zip'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    event.returnValue = result;

});