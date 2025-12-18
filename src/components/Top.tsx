import React, { useState, Fragment, useEffect } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Table } from "./Table";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";
import { Form } from "./Form";
import Settings from "./Settings";
import { useTheme } from "../theme/ThemeProvider";
import Email from "../Email";
import StatusTable from "./StatusTable";
import PersonAddAlt1TwoToneIcon from "@mui/icons-material/PersonAddAlt1TwoTone";
import PersonOffTwoToneIcon from "@mui/icons-material/PersonOffTwoTone";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import NetworkPingIcon from "@mui/icons-material/NetworkPing";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import RadarIcon from "@mui/icons-material/Radar";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { EmailSettings, SMTPConfig } from "../types/electron";

interface NewDeviceModal {
  show: boolean;
  name: string;
  address: string;
  notes: string;
  frequency: number;
  trys: number;
}

interface GeneralSettingsModal {
  show: boolean;
  settings: EmailSettings;
}

interface CloseWindowModal {
  show: boolean;
}

export default function Top() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const defaultNewDeviceModal: NewDeviceModal = {
    show: false,
    name: "",
    address: "",
    notes: "",
    frequency: 10,
    trys: 3,
  };
  const defaultGeneralSettingsModal: GeneralSettingsModal = {
    show: false,
    settings: { 
      addresses: [], 
      subject: "", 
      location: "",
      smtp: {
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: '',
        pass: ''
      }
    },
  };
  const [newDeviceModal, setNewDeviceModal] = useState<NewDeviceModal>(defaultNewDeviceModal);
  const [devices, setDevices] = useState<any[]>([]);
  const [closeWindowModal, setCloseWindowModal] = useState<CloseWindowModal>({ show: false });
  const [muteCloseWin, setMuteCloseWin] = useState<boolean>(false);

  const hideNewDeviceModal = () => setNewDeviceModal(defaultNewDeviceModal);

  const sendTest = () => {
    window.electron
      .invoke('sendTestEmail')
      .then((res: string) => console.log('Test email sent:', res))
      .catch((err: any) => console.error('Test email failed:', err));
  };

  const createDevice = () => {
    window.electron.send("newDevice", newDeviceModal);
    hideNewDeviceModal();
  };

  const pingAll = () => {
    window.electron
      .invoke("pingAll")
      .then((res: string) => console.log(res))
      .catch((err: any) => console.error(err));
  };

  useEffect(() => {
    window.electron
      .invoke("getCloseWindowWarningMute")
      .then((res: boolean) => setMuteCloseWin(res))
      .catch((err: any) => console.error(err));
    window.electron
      .invoke("getDevices")
      .then((res: any[]) => setDevices(res))
      .catch((err: any) => console.error(err));
    window.electron.receive("showCloseWarning", () =>
      setCloseWindowModal({ show: true })
    );
    window.electron.receive("devices", (devs: any[]) => setDevices(devs));
    return () => {
      window.electron.removeListener("showCloseWarning");
      window.electron.removeListener("devices");
    };
  }, []);



  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newDeviceModal.name.trim()) {
      errors.name = 'Device name is required';
    } else if (devices.some(device => device.name.toLowerCase() === newDeviceModal.name.trim().toLowerCase())) {
      errors.name = 'Device name already exists';
    }
    
    if (!newDeviceModal.address.trim()) {
      errors.address = 'IP address or hostname is required';
    } else {
      // Check for duplicate address
      if (devices.some(device => device.address.toLowerCase() === newDeviceModal.address.trim().toLowerCase())) {
        errors.address = 'IP address or hostname already exists';
      } else {
        // Basic IP validation
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?([.][a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!ipRegex.test(newDeviceModal.address) && !hostnameRegex.test(newDeviceModal.address)) {
          errors.address = 'Enter a valid IP address or hostname';
        }
      }
    }
    
    if (newDeviceModal.frequency < 15 || newDeviceModal.frequency > 720) {
      errors.frequency = 'Frequency must be between 15-720 seconds';
    }
    
    if (newDeviceModal.trys < 1 || newDeviceModal.trys > 100) {
      errors.trys = 'Tries must be between 1-100';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateDevice = () => {
    if (validateForm()) {
      createDevice();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateDevice();
    }
  };

  const makeNewDeviceModal = (): React.ReactElement | null => {
    if (newDeviceModal.show) {
      return (
        <Modal
          show={newDeviceModal.show}
          onHide={hideNewDeviceModal}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Device</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onKeyPress={handleKeyPress}>
              {/* Device Information Section */}
              <div style={{ marginBottom: theme.spacing.lg }}>
                <h4 style={{ 
                  color: theme.colors.primary, 
                  fontSize: theme.fontSize.md, 
                  marginBottom: theme.spacing.md,
                  fontFamily: theme.fonts.display,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Device Information
                </h4>
                
                <div style={{ marginBottom: theme.spacing.md }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: theme.spacing.xs, 
                    color: theme.colors.text,
                    fontSize: theme.fontSize.sm,
                    fontWeight: 'bold'
                  }}>
                    Device Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Main Router, Server-01"
                    value={newDeviceModal.name}
                    onChange={e => {
                      setNewDeviceModal(old => ({ ...old, name: e.target.value }));
                      if (validationErrors.name) {
                        setValidationErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    style={{
                      borderColor: validationErrors.name ? theme.colors.danger : theme.colors.primary,
                      transition: 'all 0.3s ease',
                      ...(validationErrors.name && { boxShadow: `0 0 8px ${theme.colors.danger}40` })
                    }}
                    autoFocus
                  />
                  {validationErrors.name && (
                    <div style={{ 
                      color: theme.colors.danger, 
                      fontSize: theme.fontSize.sm, 
                      marginTop: theme.spacing.xs,
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      {validationErrors.name}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: theme.spacing.md }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: theme.spacing.xs, 
                    color: theme.colors.text,
                    fontSize: theme.fontSize.sm,
                    fontWeight: 'bold'
                  }}>
                    IP Address / Hostname *
                  </label>
                  <Input
                    type="text"
                    placeholder="192.168.1.1 or google.com"
                    value={newDeviceModal.address}
                    onChange={e => {
                      setNewDeviceModal(old => ({ ...old, address: e.target.value }));
                      if (validationErrors.address) {
                        setValidationErrors(prev => ({ ...prev, address: '' }));
                      }
                    }}
                    style={{
                      borderColor: validationErrors.address ? theme.colors.danger : theme.colors.primary,
                      transition: 'all 0.3s ease',
                      ...(validationErrors.address && { boxShadow: `0 0 8px ${theme.colors.danger}40` })
                    }}
                  />
                  {validationErrors.address && (
                    <div style={{ 
                      color: theme.colors.danger, 
                      fontSize: theme.fontSize.sm, 
                      marginTop: theme.spacing.xs,
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      {validationErrors.address}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: theme.spacing.md }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: theme.spacing.xs, 
                    color: theme.colors.text,
                    fontSize: theme.fontSize.sm,
                    fontWeight: 'bold'
                  }}>
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Additional information about this device..."
                    value={newDeviceModal.notes}
                    onChange={e =>
                      setNewDeviceModal(old => ({ ...old, notes: e.target.value }))
                    }
                    style={{ minHeight: '60px' }}
                  />
                </div>
              </div>

              {/* Ping Configuration Section */}
              <div style={{ marginBottom: theme.spacing.lg }}>
                <h4 style={{ 
                  color: theme.colors.secondary, 
                  fontSize: theme.fontSize.md, 
                  marginBottom: theme.spacing.md,
                  fontFamily: theme.fonts.display,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Ping Configuration
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: theme.spacing.xs, 
                      color: theme.colors.text,
                      fontSize: theme.fontSize.sm,
                      fontWeight: 'bold'
                    }}>
                      Ping Frequency
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                      <Input
                        type="number"
                        min="15"
                        max="720"
                        value={newDeviceModal.frequency}
                        onChange={e => {
                          setNewDeviceModal(old => ({ ...old, frequency: parseFloat(e.target.value) || 15 }));
                          if (validationErrors.frequency) {
                            setValidationErrors(prev => ({ ...prev, frequency: '' }));
                          }
                        }}
                        style={{
                          width: '80px',
                          borderColor: validationErrors.frequency ? theme.colors.danger : theme.colors.primary,
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <span style={{ color: theme.colors.text, fontSize: theme.fontSize.sm }}>seconds</span>
                    </div>
                    {validationErrors.frequency && (
                      <div style={{ 
                        color: theme.colors.danger, 
                        fontSize: theme.fontSize.sm, 
                        marginTop: theme.spacing.xs
                      }}>
                        {validationErrors.frequency}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: theme.spacing.xs, 
                      color: theme.colors.text,
                      fontSize: theme.fontSize.sm,
                      fontWeight: 'bold'
                    }}>
                      Retry Attempts
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={newDeviceModal.trys}
                        onChange={e => {
                          setNewDeviceModal(old => ({ ...old, trys: parseInt(e.target.value) || 1 }));
                          if (validationErrors.trys) {
                            setValidationErrors(prev => ({ ...prev, trys: '' }));
                          }
                        }}
                        style={{
                          width: '80px',
                          borderColor: validationErrors.trys ? theme.colors.danger : theme.colors.primary,
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <span style={{ color: theme.colors.text, fontSize: theme.fontSize.sm }}>tries</span>
                    </div>
                    {validationErrors.trys && (
                      <div style={{ 
                        color: theme.colors.danger, 
                        fontSize: theme.fontSize.sm, 
                        marginTop: theme.spacing.xs
                      }}>
                        {validationErrors.trys}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={hideNewDeviceModal}
              style={{ marginRight: theme.spacing.sm }}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              variant="primary" 
              onClick={handleCreateDevice}
              disabled={Object.keys(validationErrors).length > 0 || !newDeviceModal.name.trim() || !newDeviceModal.address.trim()}
              style={{
                background: Object.keys(validationErrors).length > 0 || !newDeviceModal.name.trim() || !newDeviceModal.address.trim() ? theme.colors.muted : 'yellow',
                border: 'none',
                boxShadow: `0 0 15px ${theme.colors.primary}40`,
                opacity: Object.keys(validationErrors).length > 0 || !newDeviceModal.name.trim() || !newDeviceModal.address.trim() ? 0.5 : 1,
                cursor: Object.keys(validationErrors).length > 0 || !newDeviceModal.name.trim() || !newDeviceModal.address.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              Add Device
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
    return null;
  };

  const closeCloseWindowModal = () => setCloseWindowModal({ show: false });

  const closeWindow = () => {
    window.electron
      .invoke("closeWindow")
      .then((res: string) => {
        console.log(res);
        closeCloseWindowModal();
      })
      .catch((err: any) => console.error(err));
  };

  const exitApp = () => {
    window.electron
      .invoke("exitApp")
      .then((res: void) => console.log(res))
      .catch((err: any) => console.error(err));
  };

  const handleCloseWindowWarinigMute = (e: React.ChangeEvent<HTMLInputElement>) => {
    window.electron
      .invoke("setCloseWindowWarningMute", e.target.checked)
      .then((res: boolean) => setMuteCloseWin(res))
      .catch((err: any) => console.error(err));
  };

  const makeCloseWindowModal = (): React.ReactElement | null => {
    if (closeWindowModal.show) {
      return (
        <Modal
          show={closeWindowModal.show}
          onHide={closeCloseWindowModal}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header>
            <Modal.Title>Close Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>Closing this window does not close Pinger.</div>
            <div>To fully close pinger click the "Stop Pinger" button.</div>
            <div
              style={{ display: "flex", alignItems: "center", padding: "10px" }}
            >
              <input
                checked={muteCloseWin}
                type="checkbox"
                onChange={handleCloseWindowWarinigMute}
              />
              <div style={{ paddingLeft: "10px" }}>
                Always run in background and hide this warning
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={exitApp}>
              Stop Pinger
            </Button>
            <Button variant="success" onClick={closeWindow}>
              Continue in background
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
    return null;
  };



  return (
    <Fragment>
      <div style={{ 
        borderBottom: `3px solid ${theme.colors.primary}`, 
        background: `linear-gradient(90deg, ${theme.colors.dark} 0%, ${theme.colors.light} 50%, ${theme.colors.dark} 100%)`,
        padding: "6px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        boxShadow: `0 2px 15px rgba(0, 212, 255, 0.3)`
      }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {location.pathname !== '/settings' && (
            <>
              <Tooltip text="Add Device">
                <IconButton onClick={() => setNewDeviceModal({ ...defaultNewDeviceModal, show: true })}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip text="Ping All Devices">
                <IconButton onClick={pingAll}>
                  <TrackChangesIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
        {location.pathname === '/settings' ? (
          <Tooltip text="Home">
            <IconButton onClick={() => navigate('/')}>
              <RadarIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip text="Settings">
            <IconButton onClick={() => navigate('/settings')}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div style={{ height: "100%", overflowY: "auto" }}>
        <Routes>
          <Route path="/email" element={<Email />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="*"
            element={
              <div>
                <StatusTable />
                {makeNewDeviceModal()}
              </div>
            }
          />
        </Routes>
      </div>
      {makeCloseWindowModal()}
    </Fragment>
  );
}
