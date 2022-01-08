var ping = require('ping');
const date = require('date-and-time');

class Pingable {
    constructor(device) {
        if (device) { Object.assign(this, device) }
        this.lastChecked = null;
        this.status = null;
        this.misses = null;
        this.lastGood = null;
        this.alarm = null;

        console.log({ ...this })
        this.timer = setInterval(() => {
            this.ping()
        }, (this.frequency * 1000));
    }
    ping = () => {
        ping.sys.probe(this.address, (isAlive) => {
            const rightNow = new Date();
            const now = date.format(rightNow, 'MM/DD/YYYY hh:mm:ss A');

            if (isAlive) {
                console.log(now + ' host ' + this.name + ' at ' + this.address + ' is alive')
                this.lastGood = now
                this.lastChecked = now
                this.status = 'ALIVE'
                this.misses = 0
                //win.webContents.send('devices', hosts)
                if (this.misses === true) {
                    this.alarm = false
                    console.log('Send Restored Email here')
                }
            } else {
                console.log(now + ' host ' + this.name + ' at ' + this.address + ' is dead')
                this.lastChecked = now
                this.status = 'DEAD'
                this.misses = this.misses + 1
                //win.webContents.send('devices', hosts)
                if (this.misses === this.trys) {
                    console.log('Send Error Email Here')
                }
            }
        });
    }

}

exports.Pingable = Pingable;