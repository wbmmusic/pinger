import React, { useState, Fragment, useEffect } from "react";
import {
  Button,
  Form,
  FormControl,
  InputGroup,
  Modal,
  Nav,
  Navbar,
  NavDropdown,
  Table,
} from "react-bootstrap";
import Email from "../Email";
import StatusTable from "./StatusTable";
import PersonAddAlt1TwoToneIcon from "@mui/icons-material/PersonAddAlt1TwoTone";
import PersonOffTwoToneIcon from "@mui/icons-material/PersonOffTwoTone";
import CheckTwoToneIcon from "@mui/icons-material/CheckTwoTone";
import { Route, Routes, useNavigate } from "react-router-dom";

export default function Top() {
  const navigate = useNavigate();
  const defaultNewDeviceModal = {
    show: false,
    name: "",
    address: "",
    notes: "",
    frequency: 10,
    trys: 3,
  };
  const defaultGeneralSettingsModal = {
    show: false,
    settings: { addresses: [], subject: "", location: "" },
  };
  const [newDeviceModal, setNewDeviceModal] = useState(defaultNewDeviceModal);
  const [generalSettingsModal, setGeneralSettingsModal] = useState(
    defaultGeneralSettingsModal
  );
  const [ogSettings, setogSettings] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [closeWindowModal, setCloseWindowModal] = useState({ show: false });
  const [muteCloseWin, setMuteCloseWin] = useState(false);

  const hideNewDeviceModal = () => setNewDeviceModal(defaultNewDeviceModal);
  const closeGeneralSettingsModal = () =>
    setGeneralSettingsModal(defaultGeneralSettingsModal);
  const sendTest = () => console.log("Send Test Email");

  const createDevice = () => {
    window.electron.send("newDevice", newDeviceModal);
    hideNewDeviceModal();
  };

  const pingAll = () => {
    window.electron
      .invoke("pingAll")
      .then(res => console.log(res))
      .catch(err => console.error(err));
  };

  const isSavable = () => {
    if (
      JSON.stringify(ogSettings) !==
      JSON.stringify(generalSettingsModal.settings)
    )
      return true;
    return false;
  };

  const emailSettings = () => {
    setGeneralSettingsModal(old => ({
      ...old,
      save: false,
      show: false,
      processing: true,
    }));
    window.electron
      .invoke("getAppSettings")
      .then(res => {
        //console.log(res)
        setGeneralSettingsModal({ show: true, settings: { ...res } });
        setogSettings(JSON.parse(JSON.stringify(res)));
      })
      .catch(err => console.error(err));
  };

  const deleteEmail = addy => {
    setGeneralSettingsModal(old => ({
      ...old,
      settings: {
        ...old.settings,
        addresses: old.settings.addresses.filter(address => address !== addy),
      },
    }));
  };

  const updateGeneralSettings = () => {
    //console.log('Handle Update Email Setting', generalSettingsModal.settings)
    window.electron
      .invoke("updateSettings", generalSettingsModal.settings)
      .then(res => closeGeneralSettingsModal())
      .catch(err => console.error(err));
  };

  const makeLaunch = () => {
    window.electron
      .invoke("getAutoLaunchSetting")
      .then(res => setAutoLaunch(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    makeLaunch();
    window.electron
      .invoke("getCloseWindowWarningMute")
      .then(res => setMuteCloseWin(res))
      .catch(err => console.error(err));
    window.electron.receive("showCloseWarning", () =>
      setCloseWindowModal({ show: true })
    );
    return () => window.electron.removeListener("showCloseWarning");
  }, []);

  const makeSettingsModal = () => {
    if (generalSettingsModal.show) {
      return (
        <Modal
          show={generalSettingsModal.show}
          onHide={closeGeneralSettingsModal}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>General Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <b>Location</b>
            </div>
            <FormControl
              size="sm"
              placeholder="Enter a descriptive location name"
              aria-label="Enter a descriptive location name"
              aria-describedby="basic-addon2"
              type="text"
              onChange={e =>
                setGeneralSettingsModal(old => ({
                  ...old,
                  settings: { ...old.settings, location: e.target.value },
                }))
              }
              value={generalSettingsModal.settings.location}
            />
            <hr />
            <div>
              <b>Email Subject</b>
            </div>
            <FormControl
              size="sm"
              placeholder="ie. Network Error Detected"
              aria-label="ie. Network Error Detected"
              aria-describedby="basic-addon2"
              type="text"
              onChange={e =>
                setGeneralSettingsModal(old => ({
                  ...old,
                  settings: { ...old.settings, subject: e.target.value },
                }))
              }
              value={generalSettingsModal.settings.subject}
            />
            <hr />
            <div>
              <b>Send To</b>
            </div>
            <div>
              <Form
                onSubmit={e => {
                  e.preventDefault();
                  setGeneralSettingsModal(old => ({
                    ...old,
                    settings: {
                      ...old.settings,
                      addresses: [...old.settings.addresses, newAddress],
                    },
                  }));
                  setNewAddress("");
                }}
              >
                <InputGroup className="mb-3">
                  <FormControl
                    size="sm"
                    placeholder="example@example.com"
                    aria-label="Add Recipient Email"
                    aria-describedby="basic-addon2"
                    type="email"
                    onChange={e => setNewAddress(e.target.value)}
                    value={newAddress}
                  />
                  <Button size="sm" type="submit" variant="outline-primary">
                    <PersonAddAlt1TwoToneIcon />
                  </Button>
                </InputGroup>
              </Form>
            </div>
            <div>
              {generalSettingsModal.settings.addresses.map((usr, i) => (
                <div
                  key={`emailAddress ${i}`}
                  style={{
                    display: "inline-block",
                    marginRight: "3px",
                    marginBottom: "1px",
                    userSelect: "none",
                    backgroundColor: "lightgray",
                    padding: "4px",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    key={"User" + i}
                    style={{
                      display: "flex",
                      fontSize: "12px",
                      alignItems: "center",
                    }}
                  >
                    {usr}
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: "10px",
                        marginLeft: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => deleteEmail(usr)}
                    >
                      <PersonOffTwoToneIcon style={{ fontSize: "16px" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              onClick={closeGeneralSettingsModal}
            >
              Close
            </Button>
            <Button
              disabled={!isSavable()}
              size="sm"
              variant="primary"
              onClick={updateGeneralSettings}
            >
              Save Settings
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
  };

  const makeNewDeviceModal = () => {
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
            <Table borderless size="sm" style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "right" }}>Name:</td>
                  <td style={{ width: "100%" }}>
                    <input
                      style={{ width: "100%" }}
                      type="text"
                      value={newDeviceModal.name}
                      onChange={e =>
                        setNewDeviceModal(old => ({
                          ...old,
                          name: e.target.value,
                        }))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right" }}>Address:</td>
                  <td>
                    <input
                      style={{ width: "100%" }}
                      type="text"
                      value={newDeviceModal.address}
                      onChange={e =>
                        setNewDeviceModal(old => ({
                          ...old,
                          address: e.target.value,
                        }))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right" }}>Notes:</td>
                  <td>
                    <textarea
                      style={{ width: "100%", fontSize: "12px" }}
                      value={newDeviceModal.notes}
                      onChange={e =>
                        setNewDeviceModal(old => ({
                          ...old,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    Ping Frequency:
                  </td>
                  <td>
                    <input
                      type="number"
                      min="15"
                      max="720"
                      value={newDeviceModal.frequency}
                      onChange={e =>
                        setNewDeviceModal(old => ({
                          ...old,
                          frequency: parseFloat(e.target.value),
                        }))
                      }
                    />
                    {" Seconds"}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    Trys Before Email:
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newDeviceModal.trys}
                      onChange={e =>
                        setNewDeviceModal(old => ({
                          ...old,
                          trys: parseInt(e.target.value),
                        }))
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button size="sm" variant="secondary" onClick={hideNewDeviceModal}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={() => createDevice()}>
              Add Device
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
  };

  const closeCloseWindowModal = () => setCloseWindowModal({ show: false });

  const closeWindow = () => {
    window.electron
      .invoke("closeWindow")
      .then(res => {
        console.log(res);
        closeCloseWindowModal();
      })
      .catch(err => console.error(err));
  };

  const exitApp = () => {
    window.electron
      .invoke("exitApp")
      .then(res => console.log(res))
      .catch(err => console.error(err));
  };

  const handleCloseWindowWarinigMute = e => {
    window.electron
      .invoke("setCloseWindowWarningMute", e.target.checked)
      .then(res => setMuteCloseWin(res))
      .catch(err => console.error(err));
  };

  const makeCloseWindowModal = () => {
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
  };

  const makeAutoRunMenu = () => {
    if (autoLaunch)
      return (
        <NavDropdown.Item
          onClick={() => {
            window.electron
              .invoke("disableAutoLaunch")
              .then(res => setAutoLaunch(res))
              .catch(err => console.error(err));
          }}
        >
          Autostart <CheckTwoToneIcon />
        </NavDropdown.Item>
      );
    return (
      <NavDropdown.Item
        onClick={() => {
          window.electron
            .invoke("enableAutoLaunch")
            .then(res => setAutoLaunch(res))
            .catch(err => console.error(err));
        }}
      >
        Autostart
      </NavDropdown.Item>
    );
  };

  return (
    <Fragment>
      <div style={{ borderTop: "1px solid lightGrey" }}>
        <Navbar bg="light" expand="sm">
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <NavDropdown title="Settings" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={emailSettings}>
                  General
                </NavDropdown.Item>
                {makeAutoRunMenu()}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => navigate("/email")}>
                  Preview Email
                </NavDropdown.Item>
                <NavDropdown.Item onClick={sendTest}>
                  Send Test Email
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => navigate("/")}>
                  Home
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Devices" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={pingAll}>Ping All</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={() =>
                    setNewDeviceModal({ ...defaultNewDeviceModal, show: true })
                  }
                >
                  Add Device
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
      <div style={{ height: "100%", overflowY: "auto" }}>
        <Routes>
          <Route path="/email" element={<Email />} />
          <Route
            path="*"
            element={
              <div>
                <StatusTable />
                {makeNewDeviceModal()}
                {makeSettingsModal()}
                {makeCloseWindowModal()}
              </div>
            }
          />
        </Routes>
      </div>
    </Fragment>
  );
}

const labelStyle = {
  textAlign: "right",
  width: "1px",
};
