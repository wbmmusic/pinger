const { app, BrowserWindow, ipcMain } = require('electron')
const { join } = require('path')
const url = require('url')

const { v4: uuid } = require('uuid');
var ping = require('ping');
const date = require('date-and-time');
const fs = require('fs');
const nodemailer = require("nodemailer");

const { autoUpdater } = require('electron-updater');

let firstReactInit = true
const isMac = process.platform === 'darwin'
var hosts = [];
var emailInfo;
var timers = []

let pathToConfig
const emptyConfig = {
  devices: [],
  email: {
    provider: '',
    email: '',
    password: '',
    addresses: []
  }
}

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
////////  SINGLE INSTANCE //////////
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
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
    webPreferences: { preload: join(__dirname, 'preload.js') },
    icon: join(__dirname, '/favicon.ico'),
    autoHideMenuBar: true
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
  win.on('closed', () => {
    win = null
  })
}

const mainInit = () => {
  const getFile = () => {
    console.log('Get File')
    let file = JSON.parse(fs.readFileSync(pathToConfig))
    //console.log(file)
    return file
  }

  const saveFile = (fileData) => {
    console.log('Save File')
    //console.log(fileData)
    let file = fs.writeFileSync(pathToConfig, JSON.stringify(fileData))
    //console.log(file)
    return file
  }

  const makeTimers = () => {
    hosts.forEach(host => {
      let timerIndex = timers.findIndex(tmr => tmr.id === host.id)
      if (timerIndex === -1) {
        timers.push({
          id: host.id,
          timer: null
        })
      }
    })
  }

  const makeDevices = () => {
    console.log('Make Devices')
    hosts = getFile().devices

    for (let i = 0; i < hosts.length; i++) {
      hosts[i].status = 'PENDING'
      hosts[i].lastChecked = null
      hosts[i].lastGood = null
      hosts[i].alarm = false
      hosts[i].misses = 0
    }
    win.webContents.send('devices', hosts)
    makeTimers();
  }

  const makeEmail = () => {
    emailInfo = getFile().email
  }

  ipcMain.handle('getDevices', () => {
    console.log('Got Request For Devices')
    return hosts
  })

  ipcMain.on('updateDevice', (e, updatedDevice) => {
    console.log('Update A Device', updatedDevice)
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
    let index2 = hosts.findIndex(dev => dev.id === updatedDevice.id)
    tempFile.devices[index] = updatedInfo
    saveFile(tempFile)
    hosts[index2] = Object.assign(hosts[index2], {
      ...updatedInfo,
      status: 'PENDING',
      lastChecked: null,
      lastGood: null,
      alarm: false,
      misses: 0
    })
    win.webContents.send('devices', hosts)
    pingOne(updatedDevice)
  })

  ipcMain.on('deleteDevice', (e, deviceID) => {
    console.log('Delete A Device', deviceID)

    let tempFile = getFile()
    let index = tempFile.devices.findIndex(dev => dev.id === deviceID)
    let index2 = hosts.findIndex(dev => dev.id === deviceID)
    let index3 = timers.findIndex(tmr => tmr.id === deviceID)
    clearTimeout(timers[index3].timer)
    timers.splice(index3, 1)
    hosts.splice(index2, 1)
    tempFile.devices.splice(index, 1)
    saveFile(tempFile)
    win.webContents.send('devices', hosts)
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
    hosts.push({
      ...tempDevice,
      status: 'PENDING',
      lastChecked: null,
      lastGood: null,
      misses: 0
    })
    saveFile(tempFile)
    makeTimers()
    pingEm()
  })

  ipcMain.on('pingAll', () => {
    console.log('Got a ping all')
    pingEm()
  })

  ipcMain.on('pingOne', (e, theOne) => {
    console.log('Got a ping all')
    pingOne(theOne)
  })

  ipcMain.on('updateEmail', (e, newEmailSettings) => {
    console.log('Update Email')
    let tempFile = getFile()
    tempFile.email = newEmailSettings
    saveFile(tempFile)
    emailInfo = newEmailSettings
    win.webContents.send('emailUpdated')
  })

  ipcMain.on('getEmailSettings', () => {
    win.webContents.send('emailSettings', emailInfo)
  })

  const pingOne = (host) => {
    // Reset the timer
    let tmrIdx = timers.findIndex(tmr => tmr.id === host.id)
    clearTimeout(timers[tmrIdx].timer)
    timers[tmrIdx].timer = setTimeout(() => {
      //console.log(host.name, 'Timer Fire')
      let theHost = hosts.find(hst => hst.id === host.id)
      pingOne(theHost)
    }, host.frequency * 1000);

    ping.sys.probe(host.address, function (isAlive) {
      const rightNow = new Date();
      const now = date.format(rightNow, 'MM/DD/YYYY hh:mm:ss A');

      if (isAlive) {
        //console.log(now + ' host ' + host.name + ' at ' + host.address + ' is alive')
        let theIndex = hosts.findIndex(aHost => aHost.name === host.name && aHost.address === host.address)
        hosts[theIndex].lastGood = now
        hosts[theIndex].lastChecked = now
        hosts[theIndex].status = 'ALIVE'
        hosts[theIndex].misses = 0
        win.webContents.send('devices', hosts)
        if (hosts[theIndex].misses === true) {
          hosts[theIndex].alarm = false
          console.log('Send Restored Email here')
        }
      } else {
        //console.log(now + ' host ' + host.name + ' at ' + host.address + ' is dead')
        let theIndex = hosts.findIndex(aHost => aHost.name === host.name && aHost.address === host.address)
        hosts[theIndex].lastChecked = now
        hosts[theIndex].status = 'DEAD'
        hosts[theIndex].misses = hosts[theIndex].misses + 1
        win.webContents.send('devices', hosts)
        if (hosts[theIndex].misses === hosts[theIndex].trys) {
          console.log('Send Error Email Here')
        }
      }
    });
  }

  const pingEm = () => {
    console.log('Pinging all')
    hosts.forEach(function (host) {
      pingOne(host)
    });
  }

  makeDevices()
  makeEmail()
  pingEm()
}

// Create myWindow, load the rest of the app, etc...
app.on('ready', () => {
  //log("-APP IS READY");
  ipcMain.on('reactIsReady', () => {

    console.log('React Is Ready')
    win.webContents.send('message', 'React Is Ready')
    win.webContents.send('app_version', { version: app.getVersion() });

    if (firstReactInit === true) {
      firstReactInit = false
      if (app.isPackaged) {
        win.webContents.send('message', 'App is packaged')

        ipcMain.on('installUpdate', () => {
          autoUpdater.quitAndInstall(true, true)
        })

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
      
    }

  })
  
  createWindow()
})
///////////////////////

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

////////////////// END App Startup ///////////////////////////////////////////////////////////////