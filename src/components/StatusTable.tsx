import React, { Fragment, useEffect, useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { Table } from "./Table";

import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { NumberInput } from "./NumberInput";
import { useTheme } from "../theme/ThemeProvider";
import SettingsTwoToneIcon from "@mui/icons-material/SettingsTwoTone";
import { Device } from "../types/electron";

interface EditDeviceModal {
  show: boolean;
  device: Device;
}

interface DeleteDeviceModal {
  show: boolean;
  id: string;
}

export default function StatusTable() {
  const theme = useTheme();
  const defaultEditDeviceModal: EditDeviceModal = { 
    show: false, 
    device: { 
      id: "", 
      name: "", 
      address: "", 
      notes: "", 
      frequency: 10, 
      trys: 3 
    } 
  };
  const defaultDeleteDeviceModal: DeleteDeviceModal = { show: false, id: "" };
  const [devices, setDevices] = useState<Device[]>([]);
  const [editDeviceModal, setEditDeviceModal] = useState<EditDeviceModal>(
    defaultEditDeviceModal
  );
  const [originalDevice, setOriginalDevice] = useState<Device | null>(null);
  const [deleteDeviceModal, setDeleteDeviceModal] = useState<DeleteDeviceModal>(
    defaultDeleteDeviceModal
  );
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [sortField, setSortField] = useState<string>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    window.electron
      .invoke("getDevices")
      .then((res: Device[]) => setDevices(res))
      .catch((err: any) => console.log(err));

    window.electron.receive("devices", (devs: Device[]) => setDevices(devs));

    return () => {
      window.electron.removeListener("devices");
    };
  }, []);

  const handleClose = () => {
    setEditDeviceModal(defaultEditDeviceModal);
    setOriginalDevice(null);
    setValidationErrors({});
  };

  const executeDeleteDevice = () => {
    console.log(deleteDeviceModal.id);
    window.electron
      .invoke("deleteDevice", deleteDeviceModal.id)
      .then((res: string) => {
        console.log(res);
        setDeleteDeviceModal(defaultDeleteDeviceModal);
        handleClose();
      })
      .catch((err: any) => console.log(err));
  };

  const deleteDevice = () => {
    console.log("Delete Device In Func", editDeviceModal.device.id);
    setDeleteDeviceModal({ show: true, id: editDeviceModal.device.id });
    handleClose();
  };

  const validateEditForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!editDeviceModal.device.name.trim()) {
      errors.name = 'Device name is required';
    } else {
      const duplicate = devices.find(device => 
        device.name.toLowerCase() === editDeviceModal.device.name.trim().toLowerCase() && 
        device.id !== editDeviceModal.device.id
      );
      if (duplicate) {
        errors.name = 'Device name already exists';
      }
    }
    
    if (!editDeviceModal.device.address.trim()) {
      errors.address = 'IP address or hostname is required';
    } else {
      const duplicate = devices.find(device => 
        device.address.toLowerCase() === editDeviceModal.device.address.trim().toLowerCase() && 
        device.id !== editDeviceModal.device.id
      );
      if (duplicate) {
        errors.address = 'IP address or hostname already exists';
      } else {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?([.][a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!ipRegex.test(editDeviceModal.device.address) && !hostnameRegex.test(editDeviceModal.device.address)) {
          errors.address = 'Enter a valid IP address or hostname';
        }
      }
    }
    
    if (editDeviceModal.device.frequency < 15 || editDeviceModal.device.frequency > 720) {
      errors.frequency = 'Frequency must be between 15-720 seconds';
    }
    
    if (editDeviceModal.device.trys < 1 || editDeviceModal.device.trys > 100) {
      errors.trys = 'Tries must be between 1-100';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateDevice = () => {
    if (validateEditForm()) {
      window.electron.send("updateDevice", editDeviceModal.device);
      setDeleteDeviceModal(defaultDeleteDeviceModal);
      handleClose();
    }
  };

  const cancelDelete = () => {
    setDeleteDeviceModal(defaultDeleteDeviceModal);
    setEditDeviceModal(old => ({ ...old, show: true }));
  };

  const changeTrys = (value: string) => {
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, trys: parseInt(value) },
    }));
    if (validationErrors.trys) {
      setValidationErrors(prev => ({ ...prev, trys: '' }));
    }
  };

  const changeFrequency = (value: string) => {
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, frequency: parseFloat(value) },
    }));
    if (validationErrors.frequency) {
      setValidationErrors(prev => ({ ...prev, frequency: '' }));
    }
  };

  const changeAddress = (theAddress: string) => {
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, address: theAddress },
    }));
    if (validationErrors.address) {
      setValidationErrors(prev => ({ ...prev, address: '' }));
    }
  };

  const changeName = (theName: string) => {
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, name: theName },
    }));
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const changeNotes = (theNotes: string) =>
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, notes: theNotes },
    }));

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return dateString.replace(/2025/g, '25');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'status' ? 'asc' : 'asc');
    }
  };

  const makeRows = () => {
    const rows: React.ReactElement[] = [];

    const sortedDevices = [...devices].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'address':
          aVal = a.address.toLowerCase();
          bVal = b.address.toLowerCase();
          break;
        case 'status':
          // DEAD first, then PENDING, then ALIVE
          const statusOrder = { 'DEAD': 0, 'PENDING': 1, 'ALIVE': 2 };
          aVal = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
          bVal = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
          break;
        case 'lastChecked':
          aVal = new Date(a.lastChecked || 0).getTime();
          bVal = new Date(b.lastChecked || 0).getTime();
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    for (let i = 0; i < sortedDevices.length; i++) {
      let styles: React.CSSProperties = { 
        verticalAlign: "middle",
        borderLeft: `4px solid transparent`
      };

      if (sortedDevices[i].status === "DEAD") {
        styles = { 
          ...styles, 
          backgroundColor: "rgba(255, 71, 87, 0.2)",
          borderLeft: `4px solid ${theme.colors.danger}`,
          color: theme.colors.text
        };
      } else if (sortedDevices[i].status === "PENDING") {
        styles = { 
          ...styles, 
          backgroundColor: "rgba(255, 167, 38, 0.2)",
          borderLeft: `4px solid ${theme.colors.warning}`,
          color: theme.colors.text
        };
      } else if (sortedDevices[i].status === "ALIVE") {
        styles = { 
          ...styles, 
          backgroundColor: "rgba(0, 255, 136, 0.1)",
          borderLeft: `4px solid ${theme.colors.success}`,
          color: theme.colors.text
        };
      }

      rows.push(
        <tr key={"row" + i}>
          <td style={styles}>{sortedDevices[i].name}</td>
          <td style={styles}>{sortedDevices[i].address}</td>
          <td style={styles}>{sortedDevices[i].status}</td>
          <td style={styles}>{formatDate(sortedDevices[i].lastChecked || '')}</td>
          <td style={styles}>{formatDate(sortedDevices[i].lastGood || '')}</td>
          <td style={{ ...styles, textAlign: 'center' }}>
            <Button
              onClick={() => window.electron.send("pingOne", sortedDevices[i])}
              size="sm"
            >
              Ping
            </Button>
          </td>
          <td style={{ ...styles, textAlign: 'center' }}>
            <div
              style={{ display: "inline-block", cursor: "pointer" }}
              onClick={() => {
                setEditDeviceModal({ show: true, device: sortedDevices[i] });
                setOriginalDevice(sortedDevices[i]);
              }}
            >
              <SettingsTwoToneIcon />
            </div>
          </td>
        </tr>
      );
    }
    return rows;
  };

  const makeDeleteDeviceModal = (): React.ReactElement | null => {
    if (deleteDeviceModal.show) {
      return (
        <Modal show={deleteDeviceModal.show} onHide={cancelDelete}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete Device</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are You sure you want to delete this device?</Modal.Body>
          <Modal.Footer>
            <Button size="sm" variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={executeDeleteDevice}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
    return null;
  };

  const makeEditDeviceModal = (): React.ReactElement | null => {
    if (editDeviceModal.show) {
      return (
        <Modal show={editDeviceModal.show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Device</Modal.Title>
          </Modal.Header>
          <Modal.Body>
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
                  Device Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Main Router, Server-01"
                  value={editDeviceModal.device.name}
                  onChange={e => changeName(e.target.value)}
                  style={{
                    borderColor: validationErrors.name ? theme.colors.danger : theme.colors.primary,
                    transition: 'all 0.3s ease',
                    ...(validationErrors.name && { boxShadow: `0 0 8px ${theme.colors.danger}40` })
                  }}
                />
                {validationErrors.name && (
                  <div style={{ 
                    color: theme.colors.danger, 
                    fontSize: theme.fontSize.sm, 
                    marginTop: theme.spacing.xs
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
                  IP Address / Hostname
                </label>
                <Input
                  type="text"
                  placeholder="192.168.1.1 or google.com"
                  value={editDeviceModal.device.address}
                  onChange={e => changeAddress(e.target.value)}
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
                    marginTop: theme.spacing.xs
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
                  value={editDeviceModal.device.notes}
                  onChange={e => changeNotes(e.target.value)}
                  style={{ minHeight: '60px' }}
                />
              </div>

              <div style={{ marginBottom: theme.spacing.md }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  color: theme.colors.text,
                  fontSize: theme.fontSize.sm,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={editDeviceModal.device.critical || false}
                    onChange={e => setEditDeviceModal(old => ({
                      ...old,
                      device: { ...old.device, critical: e.target.checked }
                    }))}
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      accentColor: theme.colors.danger
                    }}
                  />
                  Critical Device (immediate email alerts)
                </label>
                <div style={{ 
                  fontSize: theme.fontSize.xs, 
                  color: theme.colors.muted,
                  marginTop: theme.spacing.xs,
                  marginLeft: '24px'
                }}>
                  Critical devices bypass email batching and send immediate alerts when they fail
                </div>
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
                    <NumberInput
                      value={editDeviceModal.device.frequency}
                      onChange={value => {
                        setEditDeviceModal(old => ({
                          ...old,
                          device: { ...old.device, frequency: value },
                        }));
                        if (validationErrors.frequency) {
                          setValidationErrors(prev => ({ ...prev, frequency: '' }));
                        }
                      }}
                      min={15}
                      max={720}
                      style={{ width: '80px' }}
                    />
                    <span style={{ color: theme.colors.text, fontSize: theme.fontSize.sm }}>seconds</span>
                  </div>
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
                    <NumberInput
                      value={editDeviceModal.device.trys}
                      onChange={value => {
                        setEditDeviceModal(old => ({
                          ...old,
                          device: { ...old.device, trys: value },
                        }));
                        if (validationErrors.trys) {
                          setValidationErrors(prev => ({ ...prev, trys: '' }));
                        }
                      }}
                      min={1}
                      max={100}
                      style={{ width: '80px' }}
                    />
                    <span style={{ color: theme.colors.text, fontSize: theme.fontSize.sm }}>tries</span>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              size="sm" 
              variant="danger" 
              onClick={deleteDevice}
              style={{ marginRight: 'auto' }}
            >
              Delete Device
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleClose}
              style={{ marginRight: theme.spacing.sm }}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              variant="primary" 
              onClick={updateDevice}
              disabled={
                Object.keys(validationErrors).length > 0 || 
                !editDeviceModal.device.name.trim() || 
                !editDeviceModal.device.address.trim() ||
                !originalDevice ||
                JSON.stringify(editDeviceModal.device) === JSON.stringify(originalDevice)
              }
              style={{
                background: (
                  Object.keys(validationErrors).length > 0 || 
                  !editDeviceModal.device.name.trim() || 
                  !editDeviceModal.device.address.trim() ||
                  !originalDevice ||
                  JSON.stringify(editDeviceModal.device) === JSON.stringify(originalDevice)
                ) ? theme.colors.muted : `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                border: 'none',
                boxShadow: `0 0 15px ${theme.colors.primary}40`,
                opacity: Object.keys(validationErrors).length > 0 || !editDeviceModal.device.name.trim() || !editDeviceModal.device.address.trim() ? 0.5 : 1,
                cursor: Object.keys(validationErrors).length > 0 || !editDeviceModal.device.name.trim() || !editDeviceModal.device.address.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
    return null;
  };

  const getStats = () => {
    const total = devices.length;
    const alive = devices.filter(d => d.status === 'ALIVE').length;
    const dead = devices.filter(d => d.status === 'DEAD').length;
    const pending = devices.filter(d => d.status === 'PENDING').length;
    return { total, alive, dead, pending };
  };

  const stats = getStats();

  return (
    <Fragment>
      <div style={{ 
        padding: theme.spacing.md,
        background: `linear-gradient(90deg, ${theme.colors.dark}90 0%, ${theme.colors.light}20 50%, ${theme.colors.dark}90 100%)`,
        borderBottom: `2px solid ${theme.colors.primary}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text }}>
            {stats.total}
          </div>
          <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.muted }}>
            Total Devices
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.success }}>
            {stats.alive} ({stats.total > 0 ? Math.round((stats.alive / stats.total) * 100) : 0}%)
          </div>
          <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.muted }}>
            Alive
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.danger }}>
            {stats.dead} ({stats.total > 0 ? Math.round((stats.dead / stats.total) * 100) : 0}%)
          </div>
          <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.muted }}>
            Dead
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.warning }}>
            {stats.pending} ({stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%)
          </div>
          <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.muted }}>
            Pending
          </div>
        </div>
      </div>
      <div>
        <Table size="sm" hover style={{ userSelect: "none" }}>
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('address')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Address {sortField === 'address' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('status')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('lastChecked')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Last Checked {sortField === 'lastChecked' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Last Checked Good</th>
              <th>Ping</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>{makeRows()}</tbody>
        </Table>
      </div>
      {makeEditDeviceModal()}
      {makeDeleteDeviceModal()}
    </Fragment>
  );
}
