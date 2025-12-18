import { useEffect, useState } from 'react';
import EmailTemplate from './EmailTemplate_mobile';

export default function Email() {
    const [location, setLocation] = useState('Unknown Location');
    const [emailType, setEmailType] = useState<'device-down' | 'device-recovery' | 'escalation'>('device-down');

    useEffect(() => {
        window.electron
            .invoke('getAppSettings')
            .then((settings: any) => {
                if (settings.location) {
                    setLocation(settings.location);
                }
            })
            .catch((err: any) => console.error(err));
    }, []);

    // Sample data for preview
    const sampleDevices = [
        {
            id: '1',
            name: 'Main Router',
            address: '192.168.1.1',
            status: 'DEAD',
            lastChecked: new Date().toLocaleString(),
            lastGood: '12/18/2025 08:30:15 AM'
        },
        {
            id: '2', 
            name: 'Server-01',
            address: '192.168.1.100',
            status: 'DEAD',
            lastChecked: new Date().toLocaleString(),
            lastGood: '12/18/2025 08:28:42 AM'
        }
    ];

    return (
        <EmailTemplate
            type={emailType}
            devices={sampleDevices.slice(0, 1)} // Just first device as trigger
            allAffectedDevices={sampleDevices} // All devices for context
            location={location}
            timestamp={new Date()}
        />
    );
}
