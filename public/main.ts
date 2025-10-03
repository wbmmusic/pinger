import { app, BrowserWindow, ipcMain, Tray, Menu, BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import { autoUpdater } from 'electron-updater';
import { Pingable, DeviceData } from './pingable';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) app.quit();

// Vite defines these constants for Electron Forge
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let firstReactInit = true;
let xyz: Pingable[] = [];

const pathToUserData = app.getPath('userData');
const pathToConfig = join(pathToUserData, 'pingConfig.json');

interface Device {
    id: string;
    name: string;
    address: string;
    notes: string;
    frequency: number;
    trys: number;
}

interface EmailSettings {
    addresses: string[];
    subject: string;
    location?: string;
}

interface ConfigFile {
    devices: Device[];
    settings?: EmailSettings;
    muteCloseWarning?: boolean;
}

const emptyConfig: ConfigFile = {
    devices: [],
    settings: {
        addresses: [],
        subject: 'Network Issues Have Been Detected',
        location: ''
    }
};

if (!fs.existsSync(pathToConfig)) {
    fs.writeFileSync(pathToConfig, JSON.stringify(emptyConfig, null, '\t'));
    console.log("Created Config File");
} else {
    console.log('FOUND CONFIG FILE');
}

let win: BrowserWindow;
let tray: Tray | null = null;

export { win };

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.exit();

app.on('second-instance', () => {
    if (win) {
        win.show();
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

function createWindow(): void {
    const windowOptions: BrowserWindowConstructorOptions = {
        width: 900,
        height: 700,
        show: false,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        autoHideMenuBar: true,
        title: 'Pinger v' + app.getVersion()
    };

    win = new BrowserWindow(windowOptions);

    // Load the app using Vite dev server or built files
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    win.on('close', (e) => {
        e.preventDefault();
        if (getFile().muteCloseWarning) {
            app.exit();
        } else {
            win.webContents.send('showCloseWarning');
        }
    });

    win.on('ready-to-show', () => {
        if (process.argv.indexOf('--autoStart') !== -1) return;
        else win.show();
    });
}

interface DeviceInfo {
    id: string;
    name: string;
    address: string;
    status: string;
    lastChecked: string | null;
    lastGood: string | null;
    notes: string;
    frequency: number;
    trys: number;
}

const getDevices = (): DeviceInfo[] => {
    const theDevices: DeviceInfo[] = [];
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
    }));
    return theDevices;
};

const getFile = (): ConfigFile => JSON.parse(fs.readFileSync(pathToConfig, 'utf-8'));
const saveFile = (fileData: ConfigFile): void => fs.writeFileSync(pathToConfig, JSON.stringify(fileData, null, '\t'));
const makeSettings = (): EmailSettings => getFile().settings || emptyConfig.settings!;

export const appSettings = (): EmailSettings => makeSettings();

const mainInit = (): void => {
    const updateDevices = (_name: string): void => {
        win.webContents.send('devices', getDevices());
    };

    const makeDevices = (): void => {
        console.log('Make Devices');

        const devices = getFile().devices;
        const toBeDeleted: string[] = [];

        xyz.forEach(obj => {
            let exists = false;
            devices.forEach(dev => {
                if (dev.id === obj.id) exists = true;
            });
            if (!exists) toBeDeleted.push(obj.id);
        });

        toBeDeleted.forEach(id => {
            const delIDX = xyz.findIndex(dev => dev.id === id);
            if (delIDX !== -1) {
                xyz[delIDX].clearTimer();
                xyz.splice(delIDX, 1);
            }
        });

        devices.forEach(host => {
            const existingIDX = xyz.findIndex(dev => dev.id === host.id);
            if (existingIDX === -1) {
                const pingableDevice: DeviceData = {
                    ...host,
                    status: 'PENDING',
                    lastChecked: null,
                    lastGood: null,
                    alarm: false,
                    misses: 0,
                    updateDevice: updateDevices
                };
                xyz.push(new Pingable(pingableDevice));
                xyz[xyz.length - 1].ping();
            } else {
                const keys: (keyof Device)[] = ['name', 'address', 'notes', 'frequency', 'trys'];
                let changed = false;

                keys.forEach(key => {
                    if (xyz[existingIDX][key] !== host[key]) {
                        console.log("NO MATCH");
                        (xyz[existingIDX] as any)[key] = host[key];
                        changed = true;
                    } else {
                        console.log("MATCH");
                    }
                });

                if (changed) xyz[existingIDX].ping();
            }
        });

        win.webContents.send('devices', getDevices());
    };

    ipcMain.handle('getDevices', () => getDevices());

    ipcMain.on('updateDevice', (_e, updatedDevice: Device) => {
        console.log('Update A Device');
        const updatedInfo: Device = {
            id: updatedDevice.id,
            name: updatedDevice.name,
            address: updatedDevice.address,
            notes: updatedDevice.notes,
            frequency: updatedDevice.frequency,
            trys: updatedDevice.trys
        };
        const tempFile = getFile();
        const index = tempFile.devices.findIndex(dev => dev.id === updatedDevice.id);
        tempFile.devices[index] = updatedInfo;
        saveFile(tempFile);
        makeDevices();
        win.webContents.send('devices', getDevices());
    });

    ipcMain.handle('deleteDevice', (_e, deviceID: string) => {
        console.log('Delete A Device', deviceID);
        const tempFile = getFile();
        const index = tempFile.devices.findIndex(dev => dev.id === deviceID);
        if (index !== -1) {
            tempFile.devices.splice(index, 1);
            saveFile(tempFile);
            makeDevices();
            return "Deleted";
        }
        return "Didnt Find Device to Delete";
    });

    ipcMain.on('newDevice', (_e, newDevice: Omit<Device, 'id'>) => {
        console.log('Creating New Device');
        const tempFile = getFile();
        const tempDevice: Device = {
            id: uuid(),
            name: newDevice.name,
            address: newDevice.address,
            notes: newDevice.notes,
            frequency: newDevice.frequency,
            trys: newDevice.trys
        };
        tempFile.devices.push(tempDevice);
        saveFile(tempFile);
        makeDevices();
    });

    ipcMain.handle('pingAll', () => pingEm());

    ipcMain.on('pingOne', (_e, theOne: DeviceInfo) => pingOne(theOne));

    ipcMain.handle('updateSettings', (_e, newSettings: EmailSettings) => {
        console.log('Update App Settings');
        const tempFile = getFile();
        tempFile.settings = newSettings;
        saveFile(tempFile);
        return makeSettings();
    });

    ipcMain.handle('getAppSettings', () => makeSettings());

    const pingOne = (host: DeviceInfo): void => {
        const tmrIdx = xyz.findIndex(tmr => tmr.id === host.id);
        if (tmrIdx !== -1) {
            xyz[tmrIdx].ping();
        }
    };

    const pingEm = (): string => {
        console.log('Pinging all');
        xyz.forEach(host => host.ping());
        return "Pinged All";
    };

    ipcMain.handle('setCloseWindowWarningMute', (_e, val: boolean) => {
        const tempFile = getFile();
        tempFile.muteCloseWarning = val;
        saveFile(tempFile);
        return val;
    });

    ipcMain.handle('getCloseWindowWarningMute', () => getFile().muteCloseWarning);

    ipcMain.handle('exitApp', () => app.exit());

    ipcMain.handle('closeWindow', () => {
        win.hide();
        return "closed window";
    });

    ipcMain.handle('getAutoLaunchSetting', async () => {
        return app.getLoginItemSettings().executableWillLaunchAtLogin;
    });

    ipcMain.handle('enableAutoLaunch', async () => {
        app.setLoginItemSettings({ openAtLogin: true, args: ["--autoStart"] });
        return true;
    });

    ipcMain.handle('disableAutoLaunch', async () => {
        app.setLoginItemSettings({ openAtLogin: false });
        return false;
    });

    makeDevices();
    makeSettings();
};

app.on('ready', () => {
    console.log("APP IS READY");

    // In development, Vite serves from public folder. In production, assets are in the app resources.
    const iconPath = MAIN_WINDOW_VITE_DEV_SERVER_URL 
        ? join(__dirname, '..', '..', 'public', 'favicon.ico')
        : join(process.resourcesPath, 'public', 'favicon.ico');
    
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open', click: () => win.show() },
        {
            label: 'Stop Pinger',
            click: () => {
                if (tray) tray.destroy();
                app.exit();
            }
        },
    ]);
    tray.setToolTip('Pinger');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => win.show());

    ipcMain.on('reactIsReady', () => {
        console.log('React Is Ready');
        win.webContents.send('message', process.argv);

        if (firstReactInit) {
            firstReactInit = false;
            if (app.isPackaged) {
                win.webContents.send('message', 'App is packaged');

                autoUpdater.on('error', (err) => win.webContents.send('updater', err));
                autoUpdater.on('checking-for-update', () => win.webContents.send('updater', "checking-for-update"));
                autoUpdater.on('update-available', (info) => win.webContents.send('updater', 'update-available', info));
                autoUpdater.on('update-not-available', (info) => win.webContents.send('updater', 'update-not-available', info));
                autoUpdater.on('download-progress', (info) => win.webContents.send('updater', 'download-progress', info));
                autoUpdater.on('update-downloaded', (info) => win.webContents.send('updater', 'update-downloaded', info));

                ipcMain.on('installUpdate', () => autoUpdater.quitAndInstall());

                setTimeout(() => autoUpdater.checkForUpdates(), 3000);
                setInterval(() => autoUpdater.checkForUpdates(), 1000 * 60 * 60);
            }

            setTimeout(async () => {
                // Email test commented out
                // console.log(await sendEmail(() => win.webContents.send('makeEmailBody')));
            }, 1000);
        }
    });

    createWindow();
    mainInit();
});

app.on('activate', () => {
    if (!win) createWindow();
});
