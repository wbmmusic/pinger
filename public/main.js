const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron')
const { join, dirname, resolve, basename } = require('path')
const url = require('url')

const { v4: uuid } = require('uuid');
const fs = require('fs');

const { autoUpdater } = require('electron-updater');
const { Pingable } = require('./pingable');
const { sendEmail } = require('./email');

const appFolder = dirname(process.execPath)
const updateExe = resolve(appFolder, '..', 'Update.exe')
const exeName = basename(process.execPath)

require('./email')

let firstReactInit = true
const isMac = process.platform === 'darwin'
var xyz = []

const pathToUserData = app.getPath('userData')
let pathToConfig = join(pathToUserData, 'pingConfig.json')
const emptyConfig = { devices: [], email: { addresses: [], subject: 'Network Issues Have Been Detected' } }

if (!fs.existsSync(pathToConfig)) {
    fs.writeFileSync(pathToConfig, JSON.stringify(emptyConfig, null, '\t'))
    console.log("Created Config File")
} else console.log('FOUND CONFIG FILE')

////////////////// App Startup ///////////////////////////////////////////////////////////////////
let win
let tray = null

exports.win = win
    ////////  SINGLE INSTANCE //////////
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) app.exit()

app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            win.show()
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    })
    //////  END SINGLE INSTANCE ////////

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 900,
        height: 700,
        show: false,
        webPreferences: { preload: join(__dirname, 'preload.js') },
        icon: join(__dirname, '/favicon.ico'),
        autoHideMenuBar: true,
        title: 'Pinger v' + app.getVersion()
    })

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    win.loadURL(startUrl);
    //win.maximize()

    win.on('close', (e) => {
        e.preventDefault();
        win.hide()
    })
    win.on('ready-to-show', () => {
        console.log("HEREEEE", app.getLoginItemSettings())
        if (app.getLoginItemSettings().wasOpenedAtLogin) return
        else win.show()
    })


    // Emitted when the window is closed.

}

const getDevices = () => {
    let theDevices = []
    xyz.forEach(dev => theDevices.push({
        id: dev.id,
        name: dev.name,
        address: dev.address,
        status: dev.status,
        lastChecked: dev.lastChecked,
        lastGood: dev.lastGood,
        notes: dev.notes,
        frequency: dev.frequency,
        trys: dev.trys,
    }))
    return theDevices
}

const getFile = () => JSON.parse(fs.readFileSync(pathToConfig))
const saveFile = (fileData) => fs.writeFileSync(pathToConfig, JSON.stringify(fileData, null, '\t'))
const makeEmail = () => getFile().email
exports.emailSettings = () => makeEmail()

const mainInit = () => {
    const updateDevices = (name) => win.webContents.send('devices', getDevices())

    const makeDevices = () => {
        console.log('Make Devices')

        const devices = getFile().devices

        let toBeDeleted = []
        xyz.forEach(obj => {
            let exists = false
            devices.forEach(dev => {
                if (dev.id === obj.id) exists = true
            })
            if (!exists) toBeDeleted.push(obj.id)
        })


        toBeDeleted.forEach(id => {
            const delIDX = xyz.findIndex(dev => dev.id === id)
            if (delIDX !== -1) {
                xyz[delIDX].clearTimer()
                xyz[delIDX] = null
                xyz.splice(delIDX, 1)
            }
        })

        devices.forEach(host => {
            const existingIDX = xyz.findIndex(dev => dev.id === host.id)
            if (existingIDX === -1) {
                xyz.push(new Pingable({
                    ...host,
                    status: 'PENDING',
                    lastChecked: null,
                    lastGood: null,
                    alarm: false,
                    misses: 0,
                    updateDevice: updateDevices
                }))
                xyz[xyz.length - 1].ping()
            } else {
                const keys = ['name', 'address', 'notes', 'frequency', 'trys']
                let changed = false

                keys.forEach(key => {
                    if (xyz[existingIDX][key] !== host[key]) {
                        console.log("NO MATCH")
                        xyz[existingIDX][key] = host[key]
                        changed = true
                    } else("MATCH")
                })

                if (changed) xyz[existingIDX].ping()
            }
        })

        win.webContents.send('devices', getDevices())
    }

    ipcMain.handle('getDevices', () => getDevices())

    ipcMain.on('updateDevice', (e, updatedDevice) => {
        console.log('Update A Device')
        let updatedInfo = {
            id: updatedDevice.id,
            name: updatedDevice.name,
            address: updatedDevice.address,
            notes: updatedDevice.notes,
            frequency: updatedDevice.frequency,
            trys: updatedDevice.trys
        }
        let tempFile = getFile()
        let index = tempFile.devices.findIndex(dev => dev.id === updatedDevice.id)
        tempFile.devices[index] = updatedInfo
        saveFile(tempFile)
        makeDevices()
        win.webContents.send('devices', getDevices())
    })

    ipcMain.handle('deleteDevice', (e, deviceID) => {
        console.log('Delete A Device', deviceID)
        let tempFile = getFile()
        let index = tempFile.devices.findIndex(dev => dev.id === deviceID)
        if (index !== -1) {
            tempFile.devices.splice(index, 1)
            saveFile(tempFile)
            makeDevices()
            return "Deleted"
        }
        return "Didnt Find Device to Delete"
    })

    ipcMain.on('newDevice', (e, newDevice) => {
        console.log('Creating New Device')
        let tempFile = getFile()
        let tempDevice = {
            id: uuid(),
            name: newDevice.name,
            address: newDevice.address,
            notes: newDevice.notes,
            frequency: newDevice.frequency,
            trys: newDevice.trys
        }
        tempFile.devices.push(tempDevice)
        saveFile(tempFile)
        makeDevices()
    })

    ipcMain.handle('pingAll', () => pingEm())

    ipcMain.on('pingOne', (e, theOne) => pingOne(theOne))

    ipcMain.handle('updateEmail', (e, newEmailSettings) => {
        console.log('Update Email')
        let tempFile = getFile()
        tempFile.email = newEmailSettings
        saveFile(tempFile)
        return makeEmail()
    })

    ipcMain.handle('getEmailSettings', () => makeEmail())

    const pingOne = (host) => {
        // Reset the timer
        let tmrIdx = xyz.findIndex(tmr => tmr.id === host.id)
        xyz[tmrIdx].ping()
    }

    const pingEm = () => {
        console.log('Pinging all')
        xyz.forEach(host => host.ping())
        return "Pinged All"
    }

    ipcMain.handle('getAutoLaunchSetting', async() => {
        console.log("IN DIS BITCH")
        console.log(app.getLoginItemSettings())
        return app.getLoginItemSettings().executableWillLaunchAtLogin
    })
    ipcMain.handle('enableAutoLaunch', async() => {
        app.setLoginItemSettings({
            openAtLogin: true,
            path: updateExe,
            args: [`"${exeName}`]
        })
        console.log(app.getLoginItemSettings())
        return app.getLoginItemSettings().executableWillLaunchAtLogin
    })
    ipcMain.handle('disableAutoLaunch', async() => {
        app.setLoginItemSettings({ openAtLogin: false })
        console.log(app.getLoginItemSettings())
        return app.getLoginItemSettings().executableWillLaunchAtLogin
    })

    makeDevices()
    makeEmail()
}


// Create myWindow, load the rest of the app, etc...
app.on('ready', () => {
    console.log("APP IS READY");

    tray = new Tray(join(__dirname, 'favicon.ico'))
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open', click: () => win.show() },
        {
            label: 'Exit',
            click: () => {
                tray.destroy()
                app.exit()
            }
        },
    ])
    tray.setToolTip('Pinger')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => win.show())

    ipcMain.on('reactIsReady', () => {

        console.log('React Is Ready')
        win.webContents.send('message', 'React Is Ready')
        win.webContents.send('message', app.getLoginItemSettings())

        if (firstReactInit) {
            firstReactInit = false
            if (app.isPackaged) {
                win.webContents.send('message', 'App is packaged')

                autoUpdater.on('error', (err) => win.webContents.send('updater', err))
                autoUpdater.on('checking-for-update', () => win.webContents.send('updater', "checking-for-update"))
                autoUpdater.on('update-available', (info) => win.webContents.send('updater', 'update-available', info))
                autoUpdater.on('update-not-available', (info) => win.webContents.send('updater', 'update-not-available', info))
                autoUpdater.on('download-progress', (info) => win.webContents.send('updater', 'download-progress', info))
                autoUpdater.on('update-downloaded', (info) => win.webContents.send('updater', 'update-downloaded', info))

                ipcMain.on('installUpdate', () => autoUpdater.quitAndInstall())

                setTimeout(() => autoUpdater.checkForUpdates(), 3000);
                setInterval(() => autoUpdater.checkForUpdates(), 1000 * 60 * 60);
            }


            // Send Email Test
            setTimeout(async() => {
                //console.log(await sendEmail(() => win.webContents.send('makeEmailBody')))
            }, 1000);

        }
    })

    createWindow()
    mainInit()
})

app.on('activate', () => {
    if (win === null) createWindow()
})

////////////////// END App Startup ///////////////////////////////////////////////////////////////