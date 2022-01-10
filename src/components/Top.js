
import React, { useState, Fragment, useEffect } from 'react'
import { Button, Form, FormControl, InputGroup, Modal, Nav, Navbar, NavDropdown, Table } from 'react-bootstrap'
import Email from '../Email'
import StatusTable from './StatusTable'
import PersonAddAlt1TwoToneIcon from '@mui/icons-material/PersonAddAlt1TwoTone';
import PersonOffTwoToneIcon from '@mui/icons-material/PersonOffTwoTone';

export default function Top() {
    const defaultNewDeviceModal = { show: false, name: '', address: '', notes: '', frequency: 10, trys: 3 }
    const defaultGeneralSettingsModal = { show: false, settings: { addresses: [], subject: '', location: '', } }
    const [newDeviceModal, setNewDeviceModal] = useState(defaultNewDeviceModal)
    const [generalSettingsModal, setGeneralSettingsModal] = useState(defaultGeneralSettingsModal)
    const [ogSettings, setogSettings] = useState(null)
    const [newAddress, setNewAddress] = useState('')

    const hideNewDeviceModal = () => setNewDeviceModal(defaultNewDeviceModal)
    const closeGeneralSettingsModal = () => setGeneralSettingsModal(defaultGeneralSettingsModal)
    const sendTest = () => console.log("Send Test Email")

    const createDevice = () => {
        window.electron.ipcRenderer.send('newDevice', newDeviceModal)
        hideNewDeviceModal()
    }

    const pingAll = () => {
        window.electron.ipcRenderer.invoke('pingAll')
            .then(res => console.log(res))
            .catch(err => console.error(err))
    }

    const isSavable = () => {
        if (JSON.stringify(ogSettings) !== JSON.stringify(generalSettingsModal.settings)) return true
        return false
    }

    const emailSettings = () => {
        setGeneralSettingsModal(old => ({ ...old, save: false, show: false, processing: true }))
        window.electron.ipcRenderer.invoke('getEmailSettings')
            .then(res => {
                //console.log(res)
                setGeneralSettingsModal({ show: true, settings: { ...res } })
                setogSettings(JSON.parse(JSON.stringify(res)))
            })
            .catch(err => console.error(err))
    }

    const deleteEmail = (addy) => {
        setGeneralSettingsModal(old => ({
            ...old,
            settings: {
                ...old.settings,
                addresses: old.settings.addresses.filter(address => address !== addy)
            }
        }))
    }

    const updateGeneralSettings = () => {
        //console.log('Handle Update Email Setting', generalSettingsModal.settings)
        window.electron.ipcRenderer.invoke('updateEmail', generalSettingsModal.settings)
            .then(res => closeGeneralSettingsModal())
            .catch(err => console.error(err))
    }

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
                        <div><b>Location</b></div>
                        <FormControl
                            size="sm"
                            placeholder="Enter a descriptive location name"
                            aria-label="Enter a descriptive location name"
                            aria-describedby="basic-addon2"
                            type="text"
                            onChange={(e) => setGeneralSettingsModal(old => ({ ...old, settings: { ...old.settings, location: e.target.value } }))}
                            value={generalSettingsModal.settings.location}
                        />
                        <hr />
                        <div><b>Email Subject</b></div>
                        <FormControl
                            size="sm"
                            placeholder="ie. Network Error Detected"
                            aria-label="ie. Network Error Detected"
                            aria-describedby="basic-addon2"
                            type="text"
                            onChange={(e) => setGeneralSettingsModal(old => ({ ...old, settings: { ...old.settings, subject: e.target.value } }))}
                            value={generalSettingsModal.settings.subject}
                        />
                        <hr />
                        <div><b>Send To</b></div>
                        <div>
                            <Form onSubmit={(e) => {
                                e.preventDefault()
                                setGeneralSettingsModal(old => ({ ...old, settings: { ...old.settings, addresses: [...old.settings.addresses, newAddress] } }))
                                setNewAddress('')
                            }}>
                                <InputGroup className="mb-3">
                                    <FormControl
                                        size="sm"
                                        placeholder="example@example.com"
                                        aria-label="Add Recipient Email"
                                        aria-describedby="basic-addon2"
                                        type="email"
                                        onChange={(e) => setNewAddress(e.target.value)}
                                        value={newAddress}
                                    />
                                    <Button size="sm" type="submit" variant="outline-primary"><PersonAddAlt1TwoToneIcon /></Button>
                                </InputGroup>
                            </Form>
                        </div>
                        <div>
                            {generalSettingsModal.settings.addresses.map((usr, i) => (
                                <div
                                    key={`emailAddress ${i}`}
                                    style={{
                                        display: 'inline-block',
                                        marginRight: '3px',
                                        marginBottom: '1px',
                                        userSelect: 'none',
                                        backgroundColor: 'lightgray',
                                        padding: '4px',
                                        borderRadius: '2px'
                                    }}
                                >
                                    <div
                                        key={'User' + i}
                                        style={{ display: 'flex', fontSize: '12px', alignItems: 'center' }}
                                    >
                                        {usr}
                                        <div
                                            style={{ display: 'inline-block', fontSize: '10px', marginLeft: '4px', cursor: 'pointer' }}
                                            onClick={() => deleteEmail(usr)}
                                        ><PersonOffTwoToneIcon style={{ fontSize: '16px' }} /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" variant="secondary" onClick={closeGeneralSettingsModal}>Close</Button>
                        <Button disabled={!isSavable()} size="sm" variant="primary" onClick={updateGeneralSettings}>Save Settings</Button>
                    </Modal.Footer>
                </Modal>
            )
        }
    }

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
                        <Table borderless size="sm" style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Name:</td>
                                    <td style={{ width: '100%' }} >
                                        <input
                                            style={{ width: '100%' }}
                                            type="text" value={newDeviceModal.name}
                                            onChange={(e) => setNewDeviceModal(old => ({ ...old, name: e.target.value }))} />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Address:</td>
                                    <td>
                                        <input
                                            style={{ width: '100%' }}
                                            type="text" value={newDeviceModal.address}
                                            onChange={(e) => setNewDeviceModal(old => ({ ...old, address: e.target.value }))} />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Notes:</td>
                                    <td>
                                        <textarea
                                            style={{ width: '100%', fontSize: '12px' }}
                                            value={newDeviceModal.notes}
                                            onChange={(e) => setNewDeviceModal(old => ({ ...old, notes: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Ping Frequency:</td>
                                    <td>
                                        <input type="number" min="15" max="720"
                                            value={newDeviceModal.frequency}
                                            onChange={(e) => setNewDeviceModal(old => ({ ...old, frequency: parseFloat(e.target.value) }))} />{" Seconds"}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Trys Before Email:</td>
                                    <td><input type="number" min="1" max="100"
                                        value={newDeviceModal.trys} onChange={(e) => setNewDeviceModal(old => ({ ...old, trys: parseInt(e.target.value) }))} /></td>
                                </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" variant="secondary" onClick={hideNewDeviceModal}>
                            Cancel
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => createDevice()}>Add Device</Button>
                    </Modal.Footer>
                </Modal>
            )
        }
    }

    return (
        <Fragment>
            <Navbar bg="light" expand="sm" >
                <Navbar.Brand style={{ marginLeft: '8px' }} >nubar-ping</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Settings" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={emailSettings}>General</NavDropdown.Item>
                            <NavDropdown.Item onClick={sendTest}>Send Test Email</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Devices" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={pingAll}>Ping All</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={() => setNewDeviceModal({ ...defaultNewDeviceModal, show: true })}>Add Device</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <div style={{ height: '100%', overflowY: 'auto' }}>
                <StatusTable />
                <Email />
                {makeNewDeviceModal()}
                {makeSettingsModal()}
            </div>
        </Fragment>
    )
}

const labelStyle = {
    textAlign: 'right',
    width: '1px'
}