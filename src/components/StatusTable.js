import React, { Fragment, useEffect, useState } from 'react'
import { Button, Modal, Table } from 'react-bootstrap'

const { ipcRenderer } = window.require('electron')

export default function StatusTable() {
    const defaultEditDeviceModal = {
        show: false
    }
    const [devices, setDevices] = useState([])
    const [editDeviceModal, setEditDeviceModal] = useState(defaultEditDeviceModal)
    const [deleteDeviceModal, setDeleteDeviceModal] = useState(false)

    useEffect(() => {
        ipcRenderer.on('devices', (e, theDevices) => {
            console.log(theDevices)
            setDevices(theDevices)
        })

        ipcRenderer.send('getDevices')

        return () => {
            ipcRenderer.removeAllListeners('devices')
        }
    }, [])

    const handleClose = () => {
        setEditDeviceModal(defaultEditDeviceModal)
    }

    const executeDeleteDevice = () => {
        ipcRenderer.send('deleteDevice', editDeviceModal.id)
        setDeleteDeviceModal(false)
        setEditDeviceModal(defaultEditDeviceModal)
    }

    const deleteDevice = () => {
        let tempEditDeviceModal = { ...editDeviceModal }
        tempEditDeviceModal.show = false
        setEditDeviceModal(tempEditDeviceModal)
        setDeleteDeviceModal(true)
    }

    const updateDevice = () => {
        ipcRenderer.send('updateDevice', editDeviceModal)
        setDeleteDeviceModal(false)
        setEditDeviceModal(defaultEditDeviceModal)
    }

    const cancelDelete = () => {
        setDeleteDeviceModal(false)
        let tempEditDeviceModal = { ...editDeviceModal }
        tempEditDeviceModal.show = true
        setEditDeviceModal(tempEditDeviceModal)
    }

    const changeTrys = (value) => {
        let theValue = parseInt(value)
        let tempNewDeviceModal = { ...editDeviceModal }
        tempNewDeviceModal.trys = theValue
        setEditDeviceModal(tempNewDeviceModal)
    }

    const changeFrequency = (value) => {
        let theValue = parseFloat(value)
        //console.log(theValue)
        let tempNewDeviceModal = { ...editDeviceModal }
        tempNewDeviceModal.frequency = theValue
        setEditDeviceModal(tempNewDeviceModal)
    }

    const changeAddress = (theAddress) => {
        //console.log(theAddress)
        let tempNewDeviceModal = { ...editDeviceModal }
        tempNewDeviceModal.address = theAddress
        setEditDeviceModal(tempNewDeviceModal)
    }

    const changeName = (theName) => {
        //console.log(theName)
        let tempNewDeviceModal = { ...editDeviceModal }
        tempNewDeviceModal.name = theName
        setEditDeviceModal(tempNewDeviceModal)
    }

    const changeNotes = (theNotes) => {
        //console.log(theNotes)
        let tempNewDeviceModal = { ...editDeviceModal }
        tempNewDeviceModal.notes = theNotes
        setEditDeviceModal(tempNewDeviceModal)
    }

    const makeRows = () => {
        let rows = []

        for (let i = 0; i < devices.length; i++) {
            let styles = {}

            if (devices[i].status === 'DEAD') {
                styles = { backgroundColor: '#FFA0A0' }
            } else if (devices[i].status === 'PENDING') {
                styles = { backgroundColor: 'yellow' }
            }

            rows.push(
                <tr key={'row' + i}>
                    <td style={{ ...styles }}>{devices[i].name}</td>
                    <td style={styles}>{devices[i].address}</td>
                    <td style={styles}>{devices[i].status}</td>
                    <td style={styles}>{devices[i].lastChecked}</td>
                    <td style={styles}>{devices[i].lastGood}</td>
                    <td style={styles}><button onClick={() => console.log('Ping ' + devices[i].id)} size="sm">Ping</button></td>
                    <td style={styles}>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => {
                                let tempXX = { ...devices[i] }
                                tempXX.show = true
                                setEditDeviceModal(tempXX)
                            }}
                        >
                            ⚙️
                        </div>
                    </td>
                </tr>
            )
        }
        return rows
    }

    return (
        <Fragment>
            <Table size="sm" striped>
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
                <tbody>
                    {makeRows()}
                </tbody>
            </Table>
            <Modal show={editDeviceModal.show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table borderless size="sm">
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Name:</td>
                                <td>
                                    <input
                                        style={{ width: '100%' }}
                                        type="text" value={editDeviceModal.name}
                                        onChange={(e) => changeName(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Address:</td>
                                <td>
                                    <input
                                        style={{ width: '100%' }}
                                        type="text" value={editDeviceModal.address}
                                        onChange={(e) => changeAddress(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Notes:</td>
                                <td>
                                    <textarea
                                        style={{ width: '100%', fontSize: '12px' }}
                                        value={editDeviceModal.notes}
                                        onChange={(e) => changeNotes(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Ping Frequency:</td>
                                <td>
                                    <input type="number" min="15" max="720"
                                        value={editDeviceModal.frequency}
                                        onChange={(e) => changeFrequency(e.target.value)} />{" Seconds"}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Trys Before Email:</td>
                                <td><input type="number" min="1" max="100"
                                    value={editDeviceModal.trys} onChange={(e) => changeTrys(e.target.value)} /></td>
                            </tr>
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" variant="danger" onClick={deleteDevice}>Delete Device</Button>
                    <Button size="sm" variant="secondary" onClick={handleClose}>Close</Button>
                    <Button size="sm" variant="primary" onClick={updateDevice}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={deleteDeviceModal} onHide={cancelDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are You sure you want to delete this device?
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" variant="secondary" onClick={cancelDelete}>Cancel</Button>
                    <Button size="sm" variant="danger" onClick={executeDeleteDevice}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    )
}
