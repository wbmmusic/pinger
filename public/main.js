const { app, BrowserWindow, ipcMain } = require('electron')
const { join } = require('path')
const url = require('url')

const { v4: uuid } = require('uuid');
const fs = require('fs');

const { autoUpdater } = require('electron-updater');
const { Pingable } = require('./pingable');
const { sendEmail } = require('./email');

require('./email')

let firstReactInit = true
const isMac = process.platform === 'darwin'
var emailInfo;
var xyz = []

let pathToConfig
const emptyConfig = { devices: [], email: { addresses: [], subject: 'Network Issues Have Been Detected!' } }

if (isMac) {

} else {
  pathToConfig = join('C:', 'ProgramData', 'WBM Tek', 'nubarPing', 'pingConfig.json')
  if (!fs.existsSync(pathToConfig)) {
    console.log('DOESN\'T EXIST')
    if (fs.existsSync(join('C:', 'ProgramData'))) {
      fs.mkdirSync(join('C:', 'ProgramData', 'WBM Tek', 'nubarPing'), { recursive: true })
      fs.writeFileSync(pathToConfig, JSON.stringify(emptyConfig))
    } else {
      console.log('NO PROGRAMDATA FOLDER')
    }
  } else {
    console.log('FOUND CONFIG FILE')
  }
}

////////////////// App Startup ///////////////////////////////////////////////////////////////////
let win
exports.win = win
////////  SINGLE INSTANCE //////////
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) app.quit()

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (win) {
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
    title: 'nubar Ping v' + app.getVersion()
  })

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  win.loadURL(startUrl);
  //win.maximize()

  mainInit()

  // Emitted when the window is closed.
  win.on('closed', () => win = null)

  win.on('ready-to-show', () => win.show())
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

    getFile().devices.forEach(host => {
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
          } else ("MATCH")
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

  ipcMain.on('deleteDevice', (e, deviceID) => {
    console.log('Delete A Device', deviceID)
    let tempFile = getFile()
    let index = tempFile.devices.findIndex(dev => dev.id === deviceID)
    tempFile.devices.splice(index, 1)
    saveFile(tempFile)
    win.webContents.send('devices', getDevices())
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

  ipcMain.on('updateEmail', (e, newEmailSettings) => {
    console.log('Update Email')
    let tempFile = getFile()
    tempFile.email = newEmailSettings
    saveFile(tempFile)
    emailInfo = newEmailSettings
    win.webContents.send('emailUpdated')
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

  makeDevices()
  makeEmail()
}

// Create myWindow, load the rest of the app, etc...
app.on('ready', () => {
  //log("-APP IS READY");
  ipcMain.on('reactIsReady', () => {

    console.log('React Is Ready')
    win.webContents.send('message', 'React Is Ready')

    if (firstReactInit) {
      firstReactInit = false
      if (app.isPackaged) {
        win.webContents.send('message', 'App is packaged')

        ipcMain.on('installUpdate', () => autoUpdater.quitAndInstall(true, true))

        autoUpdater.on('checking-for-update', () => win.webContents.send('checkingForUpdates'))
        autoUpdater.on('update-available', () => win.webContents.send('updateAvailable'))
        autoUpdater.on('update-not-available', () => win.webContents.send('noUpdate'))
        autoUpdater.on('update-downloaded', (e, updateInfo, f, g) => { win.webContents.send('updateDownloaded', e) })
        autoUpdater.on('download-progress', (e) => { win.webContents.send('updateDownloadProgress', e.percent) })
        autoUpdater.on('error', (e, message) => win.webContents.send('updateError', message))

        setInterval(() => {
          win.webContents.send('message', 'Interval')
          autoUpdater.checkForUpdatesAndNotify()
        }, 600000);

        autoUpdater.checkForUpdatesAndNotify()
      }


      // Send Email Test
      setTimeout(async () => {
        //console.log(await sendEmail(() => win.webContents.send('makeEmailBody')))
      }, 1000);

    }
  })

  createWindow()
})
///////////////////////

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (win === null) createWindow()
})

////////////////// END App Startup ///////////////////////////////////////////////////////////////