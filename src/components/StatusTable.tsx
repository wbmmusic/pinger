import React, { Fragment, useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
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
  const [deleteDeviceModal, setDeleteDeviceModal] = useState<DeleteDeviceModal>(
    defaultDeleteDeviceModal
  );

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

  const handleClose = () => setEditDeviceModal(defaultEditDeviceModal);

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

  const updateDevice = () => {
    window.electron.send("updateDevice", editDeviceModal.device);
    setDeleteDeviceModal(defaultDeleteDeviceModal);
    handleClose();
  };

  const cancelDelete = () => {
    setDeleteDeviceModal(defaultDeleteDeviceModal);
    setEditDeviceModal(old => ({ ...old, show: true }));
  };

  const changeTrys = (value: string) =>
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, trys: parseInt(value) },
    }));

  const changeFrequency = (value: string) =>
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, frequency: parseFloat(value) },
    }));

  const changeAddress = (theAddress: string) =>
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, address: theAddress },
    }));

  const changeName = (theName: string) =>
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, name: theName },
    }));

  const changeNotes = (theNotes: string) =>
    setEditDeviceModal(old => ({
      ...old,
      device: { ...old.device, notes: theNotes },
    }));

  const makeRows = () => {
    const rows: React.ReactElement[] = [];

    const sortedDevices = devices.sort((a) => {
      if (a.status === "DEAD") return -1;
      else return 0;
    });

    for (let i = 0; i < sortedDevices.length; i++) {
      let styles: React.CSSProperties = { verticalAlign: "middle" };

      if (sortedDevices[i].status === "DEAD") {
        styles = { ...styles, backgroundColor: "#FFA0A0" };
      } else if (sortedDevices[i].status === "PENDING") {
        styles = { ...styles, backgroundColor: "yellow" };
      }

      rows.push(
        <tr key={"row" + i}>
          <td style={styles}>{sortedDevices[i].name}</td>
          <td style={styles}>{sortedDevices[i].address}</td>
          <td style={styles}>{sortedDevices[i].status}</td>
          <td style={styles}>{sortedDevices[i].lastChecked}</td>
          <td style={styles}>{sortedDevices[i].lastGood}</td>
          <td style={styles}>
            <Button
              onClick={() => window.electron.send("pingOne", sortedDevices[i])}
              size="sm"
            >
              Ping
            </Button>
          </td>
          <td style={styles}>
            <div
              style={{ display: "inline-block", cursor: "pointer" }}
              onClick={() =>
                setEditDeviceModal({ show: true, device: sortedDevices[i] })
              }
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
            <Table borderless size="sm">
              <tbody>
                <tr>
                  <td style={{ textAlign: "right" }}>Name:</td>
                  <td>
                    <input
                      style={{ width: "100%" }}
                      type="text"
                      value={editDeviceModal.device.name}
                      onChange={e => changeName(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right" }}>Address:</td>
                  <td>
                    <input
                      style={{ width: "100%" }}
                      type="text"
                      value={editDeviceModal.device.address}
                      onChange={e => changeAddress(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right" }}>Notes:</td>
                  <td>
                    <textarea
                      style={{ width: "100%", fontSize: "12px" }}
                      value={editDeviceModal.device.notes}
                      onChange={e => changeNotes(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right" }}>Ping Frequency:</td>
                  <td>
                    <input
                      type="number"
                      min="15"
                      max="720"
                      value={editDeviceModal.device.frequency}
                      onChange={e => changeFrequency(e.target.value)}
                    />
                    {" Seconds"}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right" }}>Trys Before Email:</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editDeviceModal.device.trys}
                      onChange={e => changeTrys(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button size="sm" variant="danger" onClick={deleteDevice}>
              Delete Device
            </Button>
            <Button size="sm" variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button size="sm" variant="primary" onClick={updateDevice}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
    return null;
  };

  return (
    <Fragment>
      <div>
        <Table size="sm" hover style={{ userSelect: "none" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Status</th>
              <th>Last Checked</th>
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
