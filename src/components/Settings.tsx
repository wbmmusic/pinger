import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { EmailSettings, SMTPConfig } from '../types/electron';
import PersonAddAlt1TwoToneIcon from '@mui/icons-material/PersonAddAlt1TwoTone';
import PersonOffTwoToneIcon from '@mui/icons-material/PersonOffTwoTone';
import { useTheme } from '../theme/ThemeProvider';


export default function Settings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [settings, setSettings] = useState<EmailSettings>({
    addresses: [],
    subject: '',
    location: '',
    smtp: {
      provider: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: '',
      pass: ''
    }
  });
  const [newAddress, setNewAddress] = useState('');
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [showAdvancedEmail, setShowAdvancedEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [emailsMuted, setEmailsMuted] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<EmailSettings | null>(null);
  const [originalAutoLaunch, setOriginalAutoLaunch] = useState(false);
  const [originalEmailsMuted, setOriginalEmailsMuted] = useState(false);
  const [testEmailError, setTestEmailError] = useState<string>('');
  const [testEmailSuccess, setTestEmailSuccess] = useState<string>('');
  const [activeTemplateTab, setActiveTemplateTab] = useState<'device-down' | 'device-recovery' | 'escalation'>('device-down');
  const [previewHtml, setPreviewHtml] = useState<string>('');

  // Generate preview HTML when template tab or location changes
  useEffect(() => {
    const location = settings.location || 'Unknown Location';
    console.log('Generating preview with location:', location);
    window.electron
      .invoke('generatePreviewHtml', activeTemplateTab, location)
      .then((html: string) => {
        console.log('Preview HTML generated, location in HTML:', html.includes(location));
        setPreviewHtml(html);
      })
      .catch((err: any) => console.error('Failed to generate preview:', err));
  }, [activeTemplateTab, settings.location]);

  useEffect(() => {
    // Load settings
    window.electron
      .invoke('getAppSettings')
      .then((res: EmailSettings) => {
        setSettings(res);
        setOriginalSettings(res);
        if (!res.smtp) {
          const defaultSettings = {
            ...res,
            smtp: {
              provider: 'gmail',
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              user: '',
              pass: ''
            }
          };
          setSettings(defaultSettings);
          setOriginalSettings(defaultSettings);
        }
      })
      .catch((err: any) => console.error(err));

    // Load autolaunch setting
    window.electron
      .invoke('getAutoLaunchSetting')
      .then((res: boolean) => {
        setAutoLaunch(res);
        setOriginalAutoLaunch(res);
      })
      .catch((err: any) => console.error(err));

    // Load emails muted setting
    window.electron
      .invoke('getEmailsMuted')
      .then((res: boolean) => {
        setEmailsMuted(res);
        setOriginalEmailsMuted(res);
      })
      .catch((err: any) => console.error(err));
  }, []);

  const handleProviderChange = (provider: SMTPConfig['provider']) => {
    const configs = {
      gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
      outlook: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
      yahoo: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
      custom: { host: '', port: 587, secure: false }
    };
    
    setSettings(old => ({
      ...old,
      smtp: {
        ...old.smtp!,
        provider,
        ...configs[provider]
      }
    }));
  };

  const updateSMTP = (field: keyof SMTPConfig, value: any) => {
    setSettings(old => ({
      ...old,
      smtp: {
        ...old.smtp!,
        [field]: value
      }
    }));
  };

  const addEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress) {
      setSettings(old => ({
        ...old,
        addresses: [...old.addresses, newAddress]
      }));
      setNewAddress('');
    }
  };

  const deleteEmail = (email: string) => {
    setSettings(old => ({
      ...old,
      addresses: old.addresses.filter(addr => addr !== email)
    }));
  };

  const saveSettings = () => {
    window.electron
      .invoke('updateSettings', settings)
      .then(() => {
        setOriginalSettings(settings);
        console.log('Settings saved');
      })
      .catch((err: any) => console.error(err));
    
    window.electron
      .invoke('setEmailsMuted', emailsMuted)
      .then(() => {
        setOriginalEmailsMuted(emailsMuted);
        console.log('Emails muted setting saved');
      })
      .catch((err: any) => console.error(err));
  };

  const handleAutoLaunchChange = (checked: boolean) => {
    const action = checked ? 'enableAutoLaunch' : 'disableAutoLaunch';
    window.electron
      .invoke(action)
      .then((res: boolean) => setAutoLaunch(res))
      .catch((err: any) => console.error(err));
  };

  const testEmail = () => {
    console.log('=== TEST CONNECTION START ===');
    console.log('Provider:', settings.smtp?.provider);
    console.log('Host:', settings.smtp?.host);
    console.log('Port:', settings.smtp?.port);
    console.log('Secure:', settings.smtp?.secure);
    console.log('User:', settings.smtp?.user);
    console.log('Password length:', settings.smtp?.pass?.length || 0);
    
    setTestEmailError('');
    setTestEmailSuccess('');
    
    window.electron
      .invoke('testEmail', settings)
      .then((res: string) => {
        console.log('=== TEST CONNECTION SUCCESS ===');
        console.log('Result:', res);
        setTestEmailSuccess('SMTP connection successful! Credentials are valid.');
        setTimeout(() => setTestEmailSuccess(''), 5000);
      })
      .catch((err: any) => {
        console.log('=== TEST CONNECTION ERROR ===');
        console.error('Full error object:', err);
        console.error('Error message:', err.message);
        
        if (err.message.includes('Application-specific password required')) {
          setTestEmailError('Gmail requires an App Password. Go to Google Account Settings → Security → 2-Step Verification → App Passwords, generate a password for "Mail" and use that instead of your regular password.');
        } else if (err.message.includes('Invalid login')) {
          setTestEmailError('Invalid email or password. Please check your credentials.');
        } else if (err.message.includes('SMTP')) {
          setTestEmailError('SMTP connection failed. Please check your email settings and try again.');
        } else {
          setTestEmailError('Connection test failed: ' + err.message);
        }
      });
  };

  const sendActualTestEmail = () => {
    console.log('=== SEND TEST EMAIL START ===');
    console.log('Sending test email to:', settings.testEmail);
    
    setTestEmailError('');
    setTestEmailSuccess('');
    
    window.electron
      .invoke('sendActualTestEmail', settings)
      .then((res: string) => {
        console.log('=== SEND TEST EMAIL SUCCESS ===');
        console.log('Result:', res);
        setTestEmailSuccess(`Test email sent successfully to ${settings.testEmail}!`);
        setTimeout(() => setTestEmailSuccess(''), 5000);
      })
      .catch((err: any) => {
        console.log('=== SEND TEST EMAIL ERROR ===');
        console.error('Full error object:', err);
        console.error('Error message:', err.message);
        
        if (err.message.includes('Application-specific password required')) {
          setTestEmailError('Gmail requires an App Password. Go to Google Account Settings → Security → 2-Step Verification → App Passwords, generate a password for "Mail" and use that instead of your regular password.');
        } else if (err.message.includes('Invalid login')) {
          setTestEmailError('Invalid email or password. Please check your credentials.');
        } else if (err.message.includes('SMTP')) {
          setTestEmailError('Failed to send test email. Please check your email settings and try again.');
        } else {
          setTestEmailError('Failed to send test email: ' + err.message);
        }
      });
  };

  const sendSimulatedAlert = () => {
    console.log('=== SEND SIMULATED ALERT START ===');
    console.log('Sending simulated network alert to:', settings.testEmail);
    
    setTestEmailError('');
    setTestEmailSuccess('');
    
    window.electron
      .invoke('sendSimulatedAlert', settings)
      .then((res: string) => {
        console.log('=== SEND SIMULATED ALERT SUCCESS ===');
        console.log('Result:', res);
        setTestEmailSuccess(`Simulated network alert sent to ${settings.testEmail}!`);
        setTimeout(() => setTestEmailSuccess(''), 5000);
      })
      .catch((err: any) => {
        console.log('=== SEND SIMULATED ALERT ERROR ===');
        console.error('Full error object:', err);
        console.error('Error message:', err.message);
        
        if (err.message.includes('Application-specific password required')) {
          setTestEmailError('Gmail requires an App Password. Go to Google Account Settings → Security → 2-Step Verification → App Passwords, generate a password for "Mail" and use that instead of your regular password.');
        } else if (err.message.includes('Invalid login')) {
          setTestEmailError('Invalid email or password. Please check your credentials.');
        } else if (err.message.includes('SMTP')) {
          setTestEmailError('Failed to send alert email. Please check your email settings and try again.');
        } else {
          setTestEmailError('Failed to send alert email: ' + err.message);
        }
      });
  };

  const getSampleDevices = () => [
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
    },
    {
      id: '3',
      name: 'Switch-A',
      address: '192.168.1.10',
      status: 'DEAD',
      lastChecked: new Date().toLocaleString(),
      lastGood: '12/18/2025 08:25:33 AM'
    }
  ];

  const sendTemplateTest = (templateType: string) => {
    console.log('=== SEND TEMPLATE TEST START ===');
    console.log('Template type:', templateType);
    console.log('Sending to:', settings.testEmail);
    
    setTestEmailError('');
    setTestEmailSuccess('');
    
    window.electron
      .invoke('sendTemplateTest', { ...settings, templateType })
      .then((res: string) => {
        console.log('=== SEND TEMPLATE TEST SUCCESS ===');
        console.log('Result:', res);
        setTestEmailSuccess(`${templateType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} test email sent to ${settings.testEmail}!`);
        setTimeout(() => setTestEmailSuccess(''), 5000);
      })
      .catch((err: any) => {
        console.log('=== SEND TEMPLATE TEST ERROR ===');
        console.error('Full error object:', err);
        console.error('Error message:', err.message);
        
        if (err.message.includes('Application-specific password required')) {
          setTestEmailError('Gmail requires an App Password. Go to Google Account Settings → Security → 2-Step Verification → App Passwords, generate a password for "Mail" and use that instead of your regular password.');
        } else if (err.message.includes('Invalid login')) {
          setTestEmailError('Invalid email or password. Please check your credentials.');
        } else if (err.message.includes('SMTP')) {
          setTestEmailError('Failed to send template test email. Please check your email settings and try again.');
        } else {
          setTestEmailError('Failed to send template test email: ' + err.message);
        }
      });
  };

  const previewEmail = () => {
    navigate('/email');
  };

  const handleEmailsMutedChange = (checked: boolean) => {
    setEmailsMuted(checked);
  };

  const isFormValid = () => {
    // Test email must be valid if provided
    if (settings.testEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.testEmail)) {
      return false;
    }
    // SMTP user must be valid email if provided
    if (settings.smtp?.user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)) {
      return false;
    }
    return true;
  };

  const hasChanges = () => {
    if (!originalSettings) return false;
    const hasActualChanges = (
      JSON.stringify(settings) !== JSON.stringify(originalSettings) ||
      autoLaunch !== originalAutoLaunch ||
      emailsMuted !== originalEmailsMuted
    );
    return hasActualChanges && isFormValid();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div>
            {/* Location */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>Location</h3>
              <Input
                placeholder="Enter a descriptive location name"
                value={settings.location}
                onChange={e => setSettings(old => ({ ...old, location: e.target.value }))}
              />
            </div>

            {/* Email Subject */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>Email Subject</h3>
              <Input
                placeholder="ie. Network Error Detected"
                value={settings.subject}
                onChange={e => setSettings(old => ({ ...old, subject: e.target.value }))}
              />
            </div>

            {/* Email Recipients */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>Email Recipients</h3>
              <form onSubmit={addEmail}>
                <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  <Input
                    placeholder="example@example.com"
                    type="email"
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                  />
                  <Button type="submit" variant="outline-primary">
                    <PersonAddAlt1TwoToneIcon />
                  </Button>
                </div>
              </form>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                {settings.addresses.map((email, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: theme.colors.dark,
                      color: theme.colors.text,
                      border: `1px solid ${theme.colors.primary}`,
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius,
                      fontSize: theme.fontSize.sm,
                    }}
                  >
                    {email}
                    <PersonOffTwoToneIcon
                      style={{ 
                        marginLeft: theme.spacing.xs, 
                        cursor: 'pointer', 
                        fontSize: '16px',
                        color: theme.colors.danger
                      }}
                      onClick={() => deleteEmail(email)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Autostart */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>System</h3>
              <Checkbox
                label="Start automatically with Windows"
                checked={autoLaunch}
                onChange={e => handleAutoLaunchChange(e.target.checked)}
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div>
            {/* Email Configuration */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>Email Configuration</h3>
              <p style={{ color: theme.colors.secondary, fontSize: theme.fontSize.sm, marginBottom: theme.spacing.md, fontStyle: 'italic' }}>
                Configure the email account that will send notifications
              </p>
              <div style={{ marginBottom: theme.spacing.sm }}>
                <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>Provider:</label>
                <Select
                  value={settings.smtp?.provider || 'gmail'}
                  onChange={e => handleProviderChange(e.target.value as SMTPConfig['provider'])}
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="yahoo">Yahoo</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div style={{ marginBottom: theme.spacing.sm }}>
                <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>Email Address:</label>
                <Input
                  placeholder="Email address"
                  type="email"
                  value={settings.smtp?.user || ''}
                  onChange={e => updateSMTP('user', e.target.value)}
                />
              </div>
              <div style={{ marginBottom: theme.spacing.sm }}>
                <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>
                  {settings.smtp?.provider === 'gmail' ? 'App Password:' : 
                   settings.smtp?.provider === 'outlook' ? 'App Password:' : 
                   settings.smtp?.provider === 'yahoo' ? 'App Password:' : 'Password:'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Input
                    placeholder={
                      settings.smtp?.provider === 'gmail' ? 'Gmail App Password (16 characters)' :
                      settings.smtp?.provider === 'outlook' ? 'Outlook App Password' :
                      settings.smtp?.provider === 'yahoo' ? 'Yahoo App Password' :
                      'Password'
                    }
                    type={showPassword ? 'text' : 'password'}
                    value={settings.smtp?.pass || ''}
                    onChange={e => updateSMTP('pass', e.target.value)}
                    style={{ paddingRight: '50px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: theme.colors.primary,
                      cursor: 'pointer',
                      fontSize: theme.fontSize.sm,
                      fontWeight: 'bold',
                      padding: '4px 8px',
                      borderRadius: theme.borderRadius,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primary;
                      e.currentTarget.style.color = 'black';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.colors.primary;
                    }}
                  >
                    {showPassword ? '👁️' : '👁️🗨️'}
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: theme.spacing.sm }}>
                <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>Test Email Address:</label>
                <Input
                  placeholder="admin@company.com (for test emails only)"
                  type="email"
                  value={settings.testEmail || ''}
                  onChange={e => setSettings(old => ({ ...old, testEmail: e.target.value }))}
                />
                <div style={{ color: theme.colors.secondary, fontSize: theme.fontSize.xs, marginTop: theme.spacing.xs, fontStyle: 'italic' }}>
                  Test emails will be sent here instead of to all recipients
                </div>
              </div>
              
              <Button variant="outline-info" size="sm" onClick={() => setShowAdvancedEmail(!showAdvancedEmail)}>
                {showAdvancedEmail ? 'Hide' : 'Show'} Advanced Settings
              </Button>
              
              {showAdvancedEmail && (
                <div style={{ marginTop: theme.spacing.md, padding: theme.spacing.md, backgroundColor: theme.colors.dark, borderRadius: theme.borderRadius }}>
                  <div style={{ marginBottom: theme.spacing.sm }}>
                    <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>SMTP Host:</label>
                    <Input
                      value={settings.smtp?.host || ''}
                      onChange={e => updateSMTP('host', e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: theme.spacing.sm }}>
                    <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>Port:</label>
                    <Input
                      type="number"
                      value={settings.smtp?.port || 587}
                      onChange={e => updateSMTP('port', parseInt(e.target.value))}
                    />
                  </div>
                  <Checkbox
                    label="Use SSL/TLS (port 465)"
                    checked={settings.smtp?.secure || false}
                    onChange={e => updateSMTP('secure', e.target.checked)}
                  />
                </div>
              )}
            </div>

            {/* Test Buttons */}
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <Button 
                variant="outline-primary" 
                onClick={testEmail}
                disabled={
                  !settings.smtp?.user ||
                  !settings.smtp?.pass ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
                }
                style={{
                  opacity: (
                    !settings.smtp?.user ||
                    !settings.smtp?.pass ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
                  ) ? 0.5 : 1,
                  cursor: (
                    !settings.smtp?.user ||
                    !settings.smtp?.pass ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
                  ) ? 'not-allowed' : 'pointer'
                }}
              >
                Test Connection
              </Button>
              <Button 
                variant="outline-success" 
                onClick={sendActualTestEmail}
                disabled={
                  !settings.testEmail || 
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.testEmail) ||
                  !settings.smtp?.user ||
                  !settings.smtp?.pass ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
                }
                style={{
                  opacity: (
                    !settings.testEmail || 
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.testEmail) ||
                    !settings.smtp?.user ||
                    !settings.smtp?.pass ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
                  ) ? 0.5 : 1,
                  cursor: (
                    !settings.testEmail || 
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.testEmail) ||
                    !settings.smtp?.user ||
                    !settings.smtp?.pass ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
                  ) ? 'not-allowed' : 'pointer'
                }}
              >
                Send Test Email
              </Button>

            </div>
            
            {/* Test Results */}
            {testEmailError && (
              <div style={{
                marginTop: theme.spacing.md,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.danger + '20',
                border: `1px solid ${theme.colors.danger}`,
                borderRadius: theme.borderRadius,
                color: theme.colors.danger,
                fontSize: theme.fontSize.sm
              }}>
                ⚠️ {testEmailError}
              </div>
            )}
            
            {testEmailSuccess && (
              <div style={{
                marginTop: theme.spacing.md,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.success + '20',
                border: `1px solid ${theme.colors.success}`,
                borderRadius: theme.borderRadius,
                color: theme.colors.success,
                fontSize: theme.fontSize.sm
              }}>
                ✓ {testEmailSuccess}
              </div>
            )}
          </div>
        );

      case 'templates':
        return (
          <div>
            {/* Template Sub-tabs */}
            <div style={{ 
              display: 'flex', 
              borderBottom: `1px solid ${theme.colors.primary}40`, 
              marginBottom: theme.spacing.md 
            }}>
              {[
                { id: 'device-down', label: 'Device Down', color: '#ff4757' },
                { id: 'device-recovery', label: 'Recovery', color: '#2ed573' },
                { id: 'escalation', label: 'Escalation', color: '#ffa726' }
              ].map(template => (
                <button
                  key={template.id}
                  onClick={() => setActiveTemplateTab(template.id)}
                  style={{
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    background: activeTemplateTab === template.id ? template.color : 'transparent',
                    color: activeTemplateTab === template.id ? 'black' : theme.colors.text,
                    border: 'none',
                    borderRadius: `${theme.borderRadius} ${theme.borderRadius} 0 0`,
                    cursor: 'pointer',
                    fontSize: theme.fontSize.xs,
                    fontWeight: activeTemplateTab === template.id ? 'bold' : 'normal',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {template.label}
                </button>
              ))}
            </div>
            
            {/* Template Preview */}
            <div style={{ 
              marginBottom: theme.spacing.md,
              border: `1px solid ${theme.colors.primary}40`,
              borderRadius: theme.borderRadius,
              overflow: 'hidden',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '143%' }}>
                <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </div>
            </div>
            
            {/* Send Test Button */}
            <Button 
              variant="outline-primary" 
              onClick={() => sendTemplateTest(activeTemplateTab)}
              disabled={
                !settings.testEmail || 
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.testEmail) ||
                !settings.smtp?.user ||
                !settings.smtp?.pass ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
              }
              style={{
                backgroundColor: 'transparent',
                color: {
                  'device-down': '#ff4757',
                  'device-recovery': '#2ed573',
                  'escalation': '#ffa726'
                }[activeTemplateTab],
                border: `2px solid ${{
                  'device-down': '#ff4757',
                  'device-recovery': '#2ed573',
                  'escalation': '#ffa726'
                }[activeTemplateTab]}`,
                opacity: (
                  !settings.testEmail || 
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.testEmail) ||
                  !settings.smtp?.user ||
                  !settings.smtp?.pass ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
                ) ? 0.5 : 1,
                cursor: (
                  !settings.testEmail || 
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.testEmail) ||
                  !settings.smtp?.user ||
                  !settings.smtp?.pass ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.user)
                ) ? 'not-allowed' : 'pointer'
              }}
            >
              Send {activeTemplateTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Test Email
            </Button>
            
            {/* Test Results */}
            {testEmailError && (
              <div style={{
                marginTop: theme.spacing.md,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.danger + '20',
                border: `1px solid ${theme.colors.danger}`,
                borderRadius: theme.borderRadius,
                color: theme.colors.danger,
                fontSize: theme.fontSize.sm
              }}>
                ⚠️ {testEmailError}
              </div>
            )}
            
            {testEmailSuccess && (
              <div style={{
                marginTop: theme.spacing.md,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.success + '20',
                border: `1px solid ${theme.colors.success}`,
                borderRadius: theme.borderRadius,
                color: theme.colors.success,
                fontSize: theme.fontSize.sm
              }}>
                ✓ {testEmailSuccess}
              </div>
            )}
          </div>
        );

      case 'alerts':
        return (
          <div>
            {/* Email Alert Rules */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>Email Alert Rules</h3>
              <p style={{ color: theme.colors.secondary, fontSize: theme.fontSize.sm, marginBottom: theme.spacing.md, fontStyle: 'italic' }}>
                Configure when and how email notifications are sent
              </p>
              
              {/* Global Mute */}
              <div style={{ 
                marginBottom: theme.spacing.lg, 
                padding: theme.spacing.md, 
                backgroundColor: emailsMuted ? theme.colors.danger + '20' : theme.colors.dark,
                borderRadius: theme.borderRadius,
                border: `2px solid ${emailsMuted ? theme.colors.danger : theme.colors.primary}40`
              }}>
                <Checkbox
                  label="Disable all automated email alerts (test emails will still work)"
                  checked={emailsMuted}
                  onChange={e => handleEmailsMutedChange(e.target.checked)}
                  style={{ fontWeight: 'bold' }}
                />
                {emailsMuted && (
                  <div style={{ 
                    marginTop: theme.spacing.xs, 
                    color: theme.colors.danger, 
                    fontSize: theme.fontSize.sm,
                    fontStyle: 'italic'
                  }}>
                    ⚠️ All automated email alerts are currently disabled
                  </div>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                <div>
                  <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>Failure Threshold:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      defaultValue="3"
                      style={{ width: '80px' }}
                    />
                    <span style={{ color: theme.colors.text, fontSize: theme.fontSize.sm }}>consecutive failures</span>
                  </div>
                </div>
                
                <div>
                  <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>Cooldown Period:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                    <Input
                      type="number"
                      min="5"
                      max="120"
                      defaultValue="30"
                      style={{ width: '80px' }}
                    />
                    <span style={{ color: theme.colors.text, fontSize: theme.fontSize.sm }}>minutes</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: theme.spacing.md }}>
                <Checkbox label="Send recovery notifications when devices come back online" defaultChecked />
                <Checkbox label="Send escalation alerts for devices down longer than 1 hour" />
                <Checkbox label="Batch multiple device failures into single email" defaultChecked />
                <Checkbox label="Enable quiet hours (11 PM - 7 AM)" />
              </div>
              
              <div style={{ marginBottom: theme.spacing.md }}>
                <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>Daily Email Limit per Device:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    defaultValue="5"
                    style={{ width: '80px' }}
                  />
                  <span style={{ color: theme.colors.text, fontSize: theme.fontSize.sm }}>emails maximum</span>
                </div>
              </div>
              
              <div style={{ 
                padding: theme.spacing.md, 
                backgroundColor: theme.colors.dark, 
                borderRadius: theme.borderRadius,
                border: `1px solid ${theme.colors.primary}40`
              }}>
                <h4 style={{ color: theme.colors.warning, margin: '0 0 8px 0', fontSize: theme.fontSize.sm }}>Batch Alert Settings</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
                  <div>
                    <label style={{ color: theme.colors.text, fontSize: theme.fontSize.sm, display: 'block' }}>Batch Threshold:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                      <Input
                        type="number"
                        min="2"
                        max="10"
                        defaultValue="3"
                        style={{ width: '60px' }}
                      />
                      <span style={{ color: theme.colors.text, fontSize: theme.fontSize.xs }}>devices</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: theme.colors.text, fontSize: theme.fontSize.sm, display: 'block' }}>Time Window:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                      <Input
                        type="number"
                        min="5"
                        max="60"
                        defaultValue="15"
                        style={{ width: '60px' }}
                      />
                      <span style={{ color: theme.colors.text, fontSize: theme.fontSize.xs }}>minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: theme.spacing.lg, color: theme.colors.text, maxWidth: '800px' }}>
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: `2px solid ${theme.colors.primary}`, 
        marginBottom: theme.spacing.lg 
      }}>
        {[
          { id: 'general', label: 'General' },
          { id: 'email', label: 'Email Setup' },
          { id: 'templates', label: 'Email Templates' },
          { id: 'alerts', label: 'Alert Rules' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: activeTab === tab.id ? theme.colors.primary : 'transparent',
              color: activeTab === tab.id ? 'black' : theme.colors.text,
              border: 'none',
              borderRadius: `${theme.borderRadius} ${theme.borderRadius} 0 0`,
              cursor: 'pointer',
              fontSize: theme.fontSize.sm,
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Save Button */}
      {activeTab !== 'templates' && (
        <div style={{ marginTop: theme.spacing.lg, paddingTop: theme.spacing.lg, borderTop: `1px solid ${theme.colors.primary}40` }}>
          <Button 
            variant="primary" 
            onClick={saveSettings}
            disabled={!hasChanges()}
            style={{
              opacity: hasChanges() ? 1 : 0.5,
              cursor: hasChanges() ? 'pointer' : 'not-allowed'
            }}
          >
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
}