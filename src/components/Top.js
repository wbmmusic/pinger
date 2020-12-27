
import React, { useState, Fragment } from 'react'
import { Button, Modal, Nav, Navbar, NavDropdown, Table } from 'react-bootstrap'
import StatusTable from './StatusTable'
const { ipcRenderer } = window.require('electron')

export default function Top() {
    const defaultNewDeviceModal = {
        show: false,
        name: '',
        address: '',
        notes: '',
        frequency: 10,
        trys: 3
    }
    const [newDeviceModal, setNewDeviceModal] = useState(defaultNewDeviceModal)

    const addDevice = () => {
        //console.log('Add Device')
        let tempNewDeviceModal = { ...defaultNewDeviceModal }
        tempNewDeviceModal.show = true
        setNewDeviceModal(tempNewDeviceModal)
    }

    const changeTrys = (value) => {
        let theValue = parseInt(value)
        let tempNewDeviceModal = { ...newDeviceModal }
        tempNewDeviceModal.trys = theValue
        setNewDeviceModal(tempNewDeviceModal)
    }

    const changeFrequency = (value) => {
        let theValue = parseFloat(value)
        //console.log(theValue)
        let tempNewDeviceModal = { ...newDeviceModal }
        tempNewDeviceModal.frequency = theValue
        setNewDeviceModal(tempNewDeviceModal)
    }

    const changeAddress = (theAddress) => {
        //console.log(theAddress)
        let tempNewDeviceModal = { ...newDeviceModal }
        tempNewDeviceModal.address = theAddress
        setNewDeviceModal(tempNewDeviceModal)
    }

    const changeName = (theName) => {
        //console.log(theName)
        let tempNewDeviceModal = { ...newDeviceModal }
        tempNewDeviceModal.name = theName
        setNewDeviceModal(tempNewDeviceModal)
    }

    const changeNotes = (theNotes) => {
        //console.log(theNotes)
        let tempNewDeviceModal = { ...newDeviceModal }
        tempNewDeviceModal.notes = theNotes
        setNewDeviceModal(tempNewDeviceModal)
    }

    const createDevice = () => {
        ipcRenderer.send('newDevice', newDeviceModal)
        setNewDeviceModal(defaultNewDeviceModal)
    }

    const hideModal = () => {
        setNewDeviceModal(defaultNewDeviceModal)
    }

    return (
        <Fragment>
            <Navbar bg="light" expand="sm" >
                <Navbar.Brand >nubar-ping</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="Devices" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={() => console.log('Ping All')}>Ping All</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={() => addDevice()}>Add Device</NavDropdown.Item>
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
                                            onChange={(e) => changeName(e.target.value)} />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Address:</td>
                                    <td>
                                        <input
                                            style={{ width: '100%' }}
                                            type="text" value={newDeviceModal.address}
                                            onChange={(e) => changeAddress(e.target.value)} />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Notes:</td>
                                    <td>
                                        <textarea
                                            style={{ width: '100%', fontSize: '12px' }}
                                            value={newDeviceModal.notes}
                                            onChange={(e) => changeNotes(e.target.value)}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Ping Frequency:</td>
                                    <td>
                                        <input type="number" min="15" max="720"
                                            value={newDeviceModal.frequency}
                                            onChange={(e) => changeFrequency(e.target.value)} />{" Seconds"}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Trys Before Email:</td>
                                    <td><input type="number" min="1" max="100"
                                        value={newDeviceModal.trys} onChange={(e) => changeTrys(e.target.value)} /></td>
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
            </div>
        </Fragment>
    )
}
