import * as ping from 'ping';
import * as date from 'date-and-time';

export interface DeviceData {
    id: string;
    name: string;
    address: string;
    notes: string;
    frequency: number;
    trys: number;
    critical?: boolean;
    status?: string;
    lastChecked?: string | null;
    lastGood?: string | null;
    alarm?: boolean;
    misses?: number;
    updateDevice?: (deviceId: string) => void;
}

export class Pingable {
    id: string;
    name: string;
    address: string;
    notes: string;
    frequency: number;
    trys: number;
    critical: boolean;
    status: string;
    lastChecked: string | null;
    lastGood: string | null;
    alarm: boolean;
    misses: number;
    timer: NodeJS.Timeout | null;
    updateDevice: (deviceId: string) => void;

    constructor(device: DeviceData) {
        this.id = device.id;
        this.name = device.name;
        this.address = device.address;
        this.notes = device.notes;
        this.frequency = device.frequency;
        this.trys = device.trys;
        this.critical = device.critical || false;
        this.status = device.status || 'PENDING';
        this.lastChecked = device.lastChecked || null;
        this.lastGood = device.lastGood || null;
        this.alarm = device.alarm || false;
        this.misses = device.misses || 0;
        this.timer = null;
        this.updateDevice = device.updateDevice || (() => { });
    }

    ping = (): void => {
        this.clearTimer();

        this.timer = setTimeout(() => {
            this.ping();
        }, this.frequency * 1000);

        ping.promise.probe(this.address, { timeout: 5 })
            .then((res) => {
                const rightNow = new Date();
                const now = date.format(rightNow, 'MM/DD/YYYY hh:mm:ss A');

                if (res.alive) {
                    this.lastGood = now;
                    this.lastChecked = now;
                    this.status = 'ALIVE';
                    this.misses = 0;
                    this.updateDevice(this.id);

                    if (this.alarm === true) {
                        this.alarm = false;
                        console.log('Send Restored Email here');
                    }
                } else {
                    this.lastChecked = now;
                    this.status = 'DEAD';
                    this.misses = this.misses + 1;
                    this.updateDevice(this.id);

                    if (this.misses === this.trys) {
                        console.log(`[${now}] DEVICE FAILURE ALERT - Device: "${this.name}" (${this.address}) failed after ${this.trys} attempts. Status: ${this.status}, Last Good: ${this.lastGood || 'Never'}, Notes: ${this.notes || 'None'}`);
                    }
                }
            })
            .catch((error) => {
                const rightNow = new Date();
                const now = date.format(rightNow, 'MM/DD/YYYY hh:mm:ss A');
                
                this.lastChecked = now;
                this.status = 'DEAD';
                this.misses = this.misses + 1;
                this.updateDevice(this.id);

                if (this.misses === this.trys) {
                    console.log(`[${now}] DEVICE FAILURE ALERT - Device: "${this.name}" (${this.address}) failed after ${this.trys} attempts. Status: ${this.status}, Last Good: ${this.lastGood || 'Never'}, Notes: ${this.notes || 'None'}`);
                }
            });
    };

    clearTimer = (): void => {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    };
}
