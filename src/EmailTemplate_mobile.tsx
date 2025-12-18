import React from 'react';

interface Device {
  id: string;
  name: string;
  address: string;
  status: string;
  lastChecked: string | null;
  lastGood: string | null;
}

interface EmailTemplateProps {
  type: 'device-down' | 'device-recovery' | 'escalation';
  devices: Device[]; // Triggered devices (just went down/recovered)
  allAffectedDevices?: Device[]; // All currently down devices (for context)
  location: string;
  timestamp: Date;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    title?: string;
    include?: boolean;
  };
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ 
  type, 
  devices, 
  allAffectedDevices,
  location, 
  timestamp,
  contactInfo
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'device-down':
        return {
          title: 'Device Alert - Network Issue Detected',
          color: '#ff4757',
          bgColor: '#2f1b14',
          message: devices.length === 1 ? 'The following device has stopped responding:' : 'The following devices have stopped responding:'
        };
      case 'device-recovery':
        return {
          title: 'Device Recovery - Network Restored',
          color: '#2ed573',
          bgColor: '#1b2f14',
          message: devices.length === 1 ? 'The following device has come back online:' : 'The following devices have come back online:'
        };

      case 'escalation':
        return {
          title: 'Escalation Alert - Extended Outage',
          color: '#ffa726',
          bgColor: '#2f2314',
          message: 'The following device has been down for an extended period:'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      color: '#ffffff', 
      padding: '10px 0',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', padding: '0 12px' }}>
          <h1 style={{ 
            color: config.color, 
            margin: '0 0 20px 0',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            {config.title}
          </h1>
          <div style={{ 
            fontSize: '14px',
            color: '#cccccc'
          }}>
            <div style={{ marginBottom: '4px' }}>
              <strong style={{ color: config.color }}>Location:</strong> {location}
            </div>
            <div>
              <strong style={{ color: config.color }}>Time:</strong> {timestamp.toLocaleString()}
            </div>
          </div>
        </div>

        <hr style={{ border: `1px solid ${config.color}`, margin: '20px 12px' }} />

        {/* Triggered Devices Message */}
        <div style={{ 
          marginBottom: '20px', 
          fontSize: '18px',
          color: '#ffffff',
          fontWeight: 'bold',
          padding: '0 12px'
        }}>
          {config.message}
        </div>

        {/* Triggered Devices Cards */}
        <div style={{ marginBottom: '30px', padding: '0 12px' }}>
          {devices.map((device, index) => (
            <div key={device.id} style={{
              backgroundColor: config.bgColor,
              border: `2px solid ${config.color}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: index < devices.length - 1 ? '12px' : '0'
            }}>
              <table style={{ width: '100%', marginBottom: '8px' }}>
                <tr>
                  <td style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    verticalAlign: 'middle'
                  }}>
                    {device.name}
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                    <div style={{
                      backgroundColor: config.color,
                      color: type === 'device-recovery' ? '#000000' : '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}>
                      {type === 'device-recovery' ? '✓ ONLINE' : '❌ OFFLINE'}
                    </div>
                  </td>
                </tr>
              </table>
              <div style={{
                fontSize: '16px',
                color: '#cccccc',
                marginBottom: '4px'
              }}>
                {device.address}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#888888'
              }}>
                Last seen: {device.lastGood || 'Never'}
              </div>
            </div>
          ))}
        </div>

        {/* All Affected Devices Section */}
        {allAffectedDevices && allAffectedDevices.length > 0 && (
          <>
            <div style={{ 
              marginBottom: '15px', 
              fontSize: '14px',
              color: '#cccccc',
              padding: '0 12px'
            }}>
              {type === 'device-recovery' 
                ? 'Current network status - Devices still offline:'
                : 'Current network status - All offline devices:'}
            </div>
            
            <div style={{ 
              backgroundColor: '#2f1b14', 
              border: `1px solid #ff4757`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '25px',
              margin: '0 12px 25px 12px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#cc8888',
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                {allAffectedDevices.length} devices currently offline
              </div>
              {allAffectedDevices.map((device, index) => (
                <div key={device.id} style={{
                  padding: '8px 0',
                  borderBottom: index < allAffectedDevices.length - 1 ? `1px solid #ff475720` : 'none'
                }}>
                  <div style={{
                    fontSize: '15px',
                    color: '#aaaaaa',
                    fontWeight: 'bold'
                  }}>
                    {device.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#888888'
                  }}>
                    {device.address} • Last seen: {device.lastGood || 'Never'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <hr style={{ border: `1px solid ${config.color}`, margin: '20px 12px' }} />

        {/* Footer */}
        <div style={{ 
          fontSize: '12px', 
          color: '#888888',
          textAlign: 'center',
          padding: '0 12px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            This alert was generated by <strong style={{ color: config.color }}>Pinger</strong> network monitoring system
          </div>
          
          {contactInfo?.include && (contactInfo.name || contactInfo.phone || contactInfo.email) && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px',
              backgroundColor: '#2a2a2a',
              borderRadius: '6px',
              border: `1px solid ${config.color}40`
            }}>
              <div style={{ marginBottom: '5px', fontWeight: 'bold', color: config.color }}>System Administrator Contact</div>
              {contactInfo.name && <div>{contactInfo.title ? `${contactInfo.name} - ${contactInfo.title}` : contactInfo.name}</div>}
              {contactInfo.phone && <div>📞 {contactInfo.phone}</div>}
              {contactInfo.email && <div>✉️ {contactInfo.email}</div>}
            </div>
          )}
          
          <div style={{ marginTop: '10px' }}>
            Please check your network infrastructure and contact IT support if needed
          </div>
        </div>
    </div>
  );
};

export default EmailTemplate;