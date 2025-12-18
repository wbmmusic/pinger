import * as date from 'date-and-time';

interface DeviceStateChange {
    id: string;
    status: string;
    timestamp: string;
    critical: boolean;
}

interface FailedDevice {
    id: string;
    failedAt: string;
    critical: boolean;
}

interface EmailData {
    newFailures: any[];
    newRecoveries: any[];
    allCurrentlyDown: any[];
}

export class EventManager {
    private failedDevices: Map<string, FailedDevice> = new Map();
    private batchTimer: NodeJS.Timeout | null = null;
    private pendingFailures: string[] = [];
    private pendingRecoveries: string[] = [];
    private deviceStates: Map<string, string> = new Map();
    private getDeviceById: (id: string) => any;
    private getEmailsMuted: () => boolean;
    private getSettings: () => any;
    private sendEmail: (data: EmailData) => Promise<void>;

    constructor(
        getDeviceById: (id: string) => any,
        getEmailsMuted: () => boolean,
        getSettings: () => any,
        sendEmail: (data: EmailData) => Promise<void>
    ) {
        this.getDeviceById = getDeviceById;
        this.getEmailsMuted = getEmailsMuted;
        this.getSettings = getSettings;
        this.sendEmail = sendEmail;
    }

    onDeviceStateChange(id: string, status: string, critical: boolean = false): void {
        const now = date.format(new Date(), 'MM/DD/YYYY hh:mm:ss A');
        const previousStatus = this.deviceStates.get(id);
        
        // Only process if state actually changed
        if (previousStatus !== status) {
            this.deviceStates.set(id, status);
            
            if (status === 'DEAD') {
                this.handleDeviceFailure(id, now, critical);
            } else if (status === 'ALIVE') {
                this.handleDeviceRecovery(id, now);
            }
            
            // Log state change for debugging
            const device = this.getDeviceById(id);
            console.log(`[${now}] DEVICE STATE CHANGE - "${device?.name || id}" (${device?.address || 'unknown'}) -> ${status}${critical ? ' [CRITICAL]' : ''}`);
        }
    }

    private handleDeviceFailure(id: string, timestamp: string, critical: boolean): void {
        // Add to failed devices tracking
        this.failedDevices.set(id, {
            id,
            failedAt: timestamp,
            critical
        });

        // Add to pending failures
        if (!this.pendingFailures.includes(id)) {
            this.pendingFailures.push(id);
        }

        // Check for immediate triggers
        const shouldSendImmediate = this.shouldSendImmediate(critical);
        
        if (shouldSendImmediate) {
            this.sendBatchedEmail();
        } else if (!this.batchTimer) {
            // Start 30-second batch timer
            this.batchTimer = setTimeout(() => {
                this.sendBatchedEmail();
            }, 30000);
        }
    }

    private handleDeviceRecovery(id: string, timestamp: string): void {
        // Remove from failed devices tracking
        this.failedDevices.delete(id);

        // Add to pending recoveries
        if (!this.pendingRecoveries.includes(id)) {
            this.pendingRecoveries.push(id);
        }

        // Remove from pending failures if it was there
        const failureIndex = this.pendingFailures.indexOf(id);
        if (failureIndex !== -1) {
            this.pendingFailures.splice(failureIndex, 1);
        }

        // Start batch timer if not already running
        if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.sendBatchedEmail();
            }, 30000);
        }
    }

    private shouldSendImmediate(deviceCritical: boolean): boolean {
        // Critical device failure
        if (deviceCritical) {
            return true;
        }

        // Many devices threshold
        const settings = this.getSettings();
        const threshold = settings.immediateEmailThreshold || 5;
        if (this.pendingFailures.length >= threshold) {
            return true;
        }

        return false;
    }

    private async sendBatchedEmail(): Promise<void> {
        // Clear the timer
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }

        // Check if emails are muted
        if (this.getEmailsMuted()) {
            this.logMutedEmail();
            this.clearPendingEvents();
            return;
        }

        // Prepare email data
        const emailData = this.prepareEmailData();
        
        // Send email if there's something to send
        if (emailData.newFailures.length > 0 || emailData.newRecoveries.length > 0) {
            try {
                await this.sendEmail(emailData);
                console.log(`[${date.format(new Date(), 'MM/DD/YYYY hh:mm:ss A')}] EMAIL SENT - ${emailData.newFailures.length} failures, ${emailData.newRecoveries.length} recoveries`);
            } catch (error) {
                console.error(`[${date.format(new Date(), 'MM/DD/YYYY hh:mm:ss A')}] EMAIL SEND FAILED:`, error);
            }
        }

        // Clear pending events
        this.clearPendingEvents();
    }

    private prepareEmailData(): EmailData {
        const newFailures = this.pendingFailures.map(id => this.getDeviceById(id)).filter(Boolean);
        const newRecoveries = this.pendingRecoveries.map(id => this.getDeviceById(id)).filter(Boolean);
        const allCurrentlyDown = Array.from(this.failedDevices.keys()).map(id => this.getDeviceById(id)).filter(Boolean);

        return {
            newFailures,
            newRecoveries,
            allCurrentlyDown
        };
    }

    private logMutedEmail(): void {
        const emailData = this.prepareEmailData();
        const now = date.format(new Date(), 'MM/DD/YYYY hh:mm:ss A');
        
        let subject = '';
        if (emailData.newFailures.length > 0 && emailData.newRecoveries.length > 0) {
            subject = `Network Update - ${emailData.newFailures.length} Down, ${emailData.newRecoveries.length} Recovered`;
        } else if (emailData.newFailures.length > 0) {
            subject = `Network Alert - ${emailData.newFailures.length} Device${emailData.newFailures.length > 1 ? 's' : ''} Down`;
        } else if (emailData.newRecoveries.length > 0) {
            subject = `Network Recovery - ${emailData.newRecoveries.length} Device${emailData.newRecoveries.length > 1 ? 's' : ''} Restored`;
        }

        const triggerDevices = [
            ...emailData.newFailures.map(d => `${d.name} (FAILED)`),
            ...emailData.newRecoveries.map(d => `${d.name} (RECOVERED)`)
        ].join(', ');

        console.log(`[${now}] WOULD HAVE SENT EMAIL: "${subject}" - Triggered by: ${triggerDevices}`);
    }

    private clearPendingEvents(): void {
        this.pendingFailures = [];
        this.pendingRecoveries = [];
    }

    public destroy(): void {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        this.failedDevices.clear();
        this.deviceStates.clear();
        this.clearPendingEvents();
    }
}