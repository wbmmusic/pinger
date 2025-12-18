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

  useEffect(() => {
    // Load settings
    window.electron
      .invoke('getAppSettings')
      .then((res: EmailSettings) => {
        setSettings(res);
        if (!res.smtp) {
          setSettings(old => ({
            ...old,
            smtp: {
              provider: 'gmail',
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              user: '',
              pass: ''
            }
          }));
        }
      })
      .catch((err: any) => console.error(err));

    // Load autolaunch setting
    window.electron
      .invoke('getAutoLaunchSetting')
      .then((res: boolean) => setAutoLaunch(res))
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
      .then(() => console.log('Settings saved'))
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
    window.electron
      .invoke('testEmail', settings)
      .then((res: string) => console.log('Test email result:', res))
      .catch((err: any) => console.error('Test email error:', err));
  };

  const previewEmail = () => {
    navigate('/email');
  };

  return (
    <div style={{ padding: theme.spacing.lg, color: theme.colors.text, maxWidth: '800px' }}>
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h1 style={{ margin: 0, color: theme.colors.primary }}>Settings</h1>
      </div>

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
          <label style={{ color: theme.colors.text, marginBottom: theme.spacing.xs, display: 'block' }}>Password:</label>
          <div style={{ position: 'relative' }}>
            <Input
              placeholder="Password or App Password"
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
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
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

      {/* Email Alert Rules */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>Email Alert Rules</h3>
        <p style={{ color: theme.colors.secondary, fontSize: theme.fontSize.sm, marginBottom: theme.spacing.md, fontStyle: 'italic' }}>
          Configure when and how email notifications are sent
        </p>
        
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

      {/* Autostart */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>System</h3>
        <Checkbox
          label="Start automatically with Windows"
          checked={autoLaunch}
          onChange={e => handleAutoLaunchChange(e.target.checked)}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <Button variant="primary" onClick={saveSettings}>
          Save Settings
        </Button>
        <Button variant="outline-success" onClick={testEmail}>
          Test Email
        </Button>
        <Button variant="outline-info" onClick={previewEmail}>
          Preview Email
        </Button>
      </div>
    </div>
  );
}