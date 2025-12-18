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
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ 
  type, 
  devices, 
  allAffectedDevices,
  location, 
  timestamp 
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
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            color: config.color, 
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {config.title}
          </h1>
          <div style={{ 
            display: 'flex', 
            gap: '30px',
            fontSize: '14px',
            color: '#cccccc'
          }}>
            <div>
              <strong style={{ color: config.color }}>Location:</strong> {location}
            </div>
            <div>
              <strong style={{ color: config.color }}>Time:</strong> {timestamp.toLocaleString()}
            </div>
          </div>
        </div>

        <hr style={{ border: `1px solid ${config.color}`, margin: '20px 0' }} />

        {/* Message */}
        <div style={{ 
          marginBottom: '25px', 
          fontSize: '16px',
          color: '#ffffff'
        }}>
          {config.message}
        </div>

        {/* Device Table */}
        <div style={{ 
          backgroundColor: config.bgColor, 
          border: `1px solid ${config.color}`,
          borderRadius: '6px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 8px',
                  borderBottom: `2px solid ${config.color}`,
                  color: config.color,
                  fontWeight: 'bold'
                }}>Device Name</th>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 8px',
                  borderBottom: `2px solid ${config.color}`,
                  color: config.color,
                  fontWeight: 'bold'
                }}>IP Address</th>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 8px',
                  borderBottom: `2px solid ${config.color}`,
                  color: config.color,
                  fontWeight: 'bold'
                }}>Last Good Ping</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device, index) => (
                <tr key={device.id}>
                  <td style={{ 
                    padding: '10px 8px',
                    borderBottom: index < devices.length - 1 ? `1px solid ${config.color}40` : 'none',
                    color: '#ffffff'
                  }}>{device.name}</td>
                  <td style={{ 
                    padding: '10px 8px',
                    borderBottom: index < devices.length - 1 ? `1px solid ${config.color}40` : 'none',
                    color: '#cccccc'
                  }}>{device.address}</td>
                  <td style={{ 
                    padding: '10px 8px',
                    borderBottom: index < devices.length - 1 ? `1px solid ${config.color}40` : 'none',
                    color: '#cccccc'
                  }}>{device.lastGood || 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* All Affected Devices Section */}
        {allAffectedDevices && allAffectedDevices.length > 0 && (
          <>
            <div style={{ 
              marginBottom: '15px', 
              fontSize: '14px',
              color: '#cccccc'
            }}>
              {type === 'device-recovery' 
                ? 'Current network status - Devices still offline:'
                : 'Current network status - All offline devices:'}
            </div>
            
            <div style={{ 
              backgroundColor: '#1a1a1a', 
              border: `1px solid #ff475740`,
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '25px'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '10px 8px',
                      borderBottom: `1px solid #ff475740`,
                      color: '#cc8888',
                      fontWeight: 'normal'
                    }}>Device Name</th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '10px 8px',
                      borderBottom: `1px solid #ff475740`,
                      color: '#cc8888',
                      fontWeight: 'normal'
                    }}>IP Address</th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '10px 8px',
                      borderBottom: `1px solid #ff475740`,
                      color: '#cc8888',
                      fontWeight: 'normal'
                    }}>Last Good Ping</th>
                  </tr>
                </thead>
                <tbody>
                  {allAffectedDevices.map((device, index) => (
                    <tr key={device.id}>
                      <td style={{ 
                        padding: '8px',
                        borderBottom: index < allAffectedDevices.length - 1 ? `1px solid ${config.color}20` : 'none',
                        color: '#aaaaaa'
                      }}>{device.name}</td>
                      <td style={{ 
                        padding: '8px',
                        borderBottom: index < allAffectedDevices.length - 1 ? `1px solid ${config.color}20` : 'none',
                        color: '#888888'
                      }}>{device.address}</td>
                      <td style={{ 
                        padding: '8px',
                        borderBottom: index < allAffectedDevices.length - 1 ? `1px solid ${config.color}20` : 'none',
                        color: '#888888'
                      }}>{device.lastGood || 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <hr style={{ border: `1px solid ${config.color}`, margin: '20px 0' }} />

        {/* Footer */}
        <div style={{ 
          fontSize: '12px', 
          color: '#888888',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '10px' }}>
            This alert was generated by <strong style={{ color: config.color }}>Pinger</strong> network monitoring system
          </div>
          <div>
            Please check your network infrastructure and contact IT support if needed
          </div>
        </div>
    </div>
  );
};

export default EmailTemplate;