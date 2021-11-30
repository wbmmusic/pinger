
import React, { useState, Fragment, useEffect } from 'react'
import { Button, Form, FormControl, InputGroup, Modal, Nav, Navbar, NavDropdown, Spinner, Table } from 'react-bootstrap'
import StatusTable from './StatusTable'

const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

export default function Top() {
    const defaultNewDeviceModal = {
        show: false,
        name: '',
        address: '',
        notes: '',
        frequency: 10,
        trys: 3
    }
    const defaultEmailSettingsModal = {
        show: false,
        provider: '',
        email: '',
        password: '',
        newAddress: '',
        save: false,
        addresses: [],
        processing: false
    }
    const [newDeviceModal, setNewDeviceModal] = useState(defaultNewDeviceModal)
    const [emailSettingsModal, setEmailSettingsModal] = useState(defaultEmailSettingsModal)
    const [processingModal, setProcessingModal] = useState(false)

    useEffect(() => {
        window.electron.ipcRenderer.on('emailSettings', (e, emailSettings) => {
            setProcessingModal(false)
            setEmailSettingsModal(old => ({
                ...old,
                show: true,
                provider: emailSettings.provider,
                email: emailSettings.email,
                password: cryptr.decrypt(emailSettings.password),
                addresses: emailSettings.addresses
            }))
        })

        window.electron.ipcRenderer.on('emailUpdated', () => setProcessingModal(false))

        return () => {
            window.electron.ipcRenderer.removeAllListeners('emailSettings')
            window.electron.ipcRenderer.removeAllListeners('emailUpdated')
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (emailSettingsModal.save === true) {
                let thePass = cryptr.encrypt(emailSettingsModal.password)
                window.electron.ipcRenderer.send('updateEmail', {
                    provider: emailSettingsModal.provider,
                    email: emailSettingsModal.email,
                    password: thePass,
                    addresses: emailSettingsModal.addresses
                })
                closeEmailModal()
            }
        }, 100);

    }, [emailSettingsModal])

    const createDevice = () => {
        window.electron.ipcRenderer.send('newDevice', newDeviceModal)
        setNewDeviceModal(defaultNewDeviceModal)
    }

    const hideModal = () => setNewDeviceModal(defaultNewDeviceModal)

    const pingAll = () => window.electron.ipcRenderer.send('pingAll')

    const emailSettings = () => {
        setEmailSettingsModal(old => ({ ...old, save: false, show: false, processing: true }))
        window.electron.ipcRenderer.send('getEmailSettings')
    }

    const closeEmailModal = () => setEmailSettingsModal(defaultEmailSettingsModal)

    const handleUpdateEmailSettings = () => {
        setEmailSettingsModal(old => ({ ...old, save: true, show: false, processing: true }))
        console.log('Handle Update Email Setting')
    }

    const hideProcessingModal = () => setEmailSettingsModal(old => ({ ...old, processing: false }))

    return (
        <Fragment>
            <Navbar bg="light" expand="sm" >
                <Navbar.Brand style={{ marginLeft: '8px' }} >nubar-ping</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Configure" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={emailSettings}>Email Settings</NavDropdown.Item>
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
                <Modal
                    show={newDeviceModal.show}
                    onHide={hideModal}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Device</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table borderless size="sm">
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Name:</td>
                                    <td>
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
                                    <td style={{ textAlign: 'right' }}>Ping Frequency:</td>
                                    <td>
                                        <input type="number" min="15" max="720"
                                            value={newDeviceModal.frequency}
                                            onChange={(e) => setNewDeviceModal(old => ({ ...old, frequency: parseFloat(e.target.value) }))} />{" Seconds"}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Trys Before Email:</td>
                                    <td><input type="number" min="1" max="100"
                                        value={newDeviceModal.trys} onChange={(e) => setNewDeviceModal(old => ({ ...old, trys: parseInt(e.target.value) }))} /></td>
                                </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" variant="secondary" onClick={hideModal}>
                            Cancel
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => createDevice()}>Add Device</Button>
                    </Modal.Footer>
                </Modal>
                <Modal
                    show={emailSettingsModal.show}
                    onHide={closeEmailModal}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Email Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table borderless size="sm">
                            <thead>
                                <tr>
                                    <th colSpan="2">Send Email From</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={labelStyle}>Provider:</td>
                                    <td>
                                        <select>
                                            <option>Hotmail / Outlook</option>
                                            <option>Gmail</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={labelStyle}>Email:</td>
                                    <td>
                                        <FormControl
                                            size="sm"
                                            placeholder="Email Address"
                                            aria-label="Email Address"
                                            aria-describedby="basic-addon2"
                                            type="email"
                                            onChange={(e) => setEmailSettingsModal(old => ({ ...old, email: e.target.value }))}
                                            value={emailSettingsModal.email}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={labelStyle}>Password:</td>
                                    <td>
                                        <FormControl
                                            size="sm"
                                            placeholder="Email Account Password"
                                            aria-label="Email Account Password"
                                            aria-describedby="basic-addon2"
                                            type="password"
                                            onChange={(e) => setEmailSettingsModal(old => ({ ...old, password: e.target.value }))}
                                            value={emailSettingsModal.password}
                                        />

                                    </td>
                                </tr>
                            </tbody>
                            <thead>
                                <tr>
                                    <th colSpan="2">Send Email To</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={labelStyle}>Address/s:</td>
                                    <td>
                                        <div>
                                            <Form onSubmit={(e) => {
                                                e.preventDefault()
                                                let tempEmailSettingsModal = { ...emailSettingsModal }
                                                tempEmailSettingsModal.addresses.push(tempEmailSettingsModal.newAddress)
                                                tempEmailSettingsModal.newAddress = ''
                                                setEmailSettingsModal(tempEmailSettingsModal)
                                            }}>
                                                <InputGroup className="mb-3">
                                                    <FormControl
                                                        size="sm"
                                                        placeholder="Add Recipient Email"
                                                        aria-label="Add Recipient Email"
                                                        aria-describedby="basic-addon2"
                                                        type="email"
                                                        onChange={(e) => setEmailSettingsModal(old => ({ ...old, newAddress: e.target.value }))}
                                                        value={emailSettingsModal.newAddress}
                                                    />
                                                    <Button size="sm" type="submit" variant="outline-primary">➕</Button>
                                                </InputGroup>
                                            </Form>
                                        </div>
                                        <div>
                                            {emailSettingsModal.addresses.map(usr => (
                                                <div
                                                    style={{
                                                        display: 'inline-block',
                                                        fontSize: '12px',
                                                        backgroundColor: 'lightgray',
                                                        padding: '2px',
                                                        marginRight: '3px',
                                                        marginBottom: '1px',
                                                        userSelect: 'none'
                                                    }}
                                                >
                                                    {usr}
                                                    <div style={{ display: 'inline-block', fontSize: '10px', marginLeft: '4px', cursor: 'pointer' }}>
                                                        ✖️
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" variant="secondary" onClick={closeEmailModal}>Close</Button>
                        <Button size="sm" variant="primary" onClick={() => handleUpdateEmailSettings()}>Save Settings</Button>
                    </Modal.Footer>
                </Modal>
                <Modal
                    show={emailSettingsModal.processing}
                    onHide={hideProcessingModal}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Processing</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Spinner size="xl" animation="border" />
                    </Modal.Body>
                </Modal>
            </div>
        </Fragment>
    )
}

const labelStyle = {
    textAlign: 'right',
    width: '1px'
}