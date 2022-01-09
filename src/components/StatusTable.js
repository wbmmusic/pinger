import React, { Fragment, useEffect, useState } from 'react'
import { Button, Modal, Table } from 'react-bootstrap'

export default function StatusTable() {
    const defaultEditDeviceModal = { show: false, device: { name: '' } }
    const [devices, setDevices] = useState([])
    const [editDeviceModal, setEditDeviceModal] = useState(defaultEditDeviceModal)
    const [deleteDeviceModal, setDeleteDeviceModal] = useState(false)

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getDevices')
            .then(res => setDevices(res))
            .catch(err => console.log(err))

        window.electron.receive('devices', (devs) => setDevices(devs))

        return () => {
            window.electron.removeListener('devices')
        }
    }, [])

    const handleClose = () => setEditDeviceModal(defaultEditDeviceModal)

    const executeDeleteDevice = () => {
        window.electron.ipcRenderer.send('deleteDevice', editDeviceModal.device.id)
        setDeleteDeviceModal(false)
        handleClose()
    }

    const deleteDevice = () => {
        handleClose()
        setDeleteDeviceModal(true)
    }

    const updateDevice = () => {
        window.electron.ipcRenderer.send('updateDevice', editDeviceModal.device)
        setDeleteDeviceModal(false)
        handleClose()
    }

    const cancelDelete = () => {
        setDeleteDeviceModal(false)
        setEditDeviceModal(old => ({ ...old, show: true }))
    }

    const changeTrys = (value) => setEditDeviceModal(old => ({ ...old, device: { ...old.device, trys: parseInt(value) } }))
    const changeFrequency = (value) => setEditDeviceModal(old => ({ ...old, device: { ...old.device, frequency: parseFloat(value) } }))
    const changeAddress = (theAddress) => setEditDeviceModal(old => ({ ...old, device: { ...old.device, address: theAddress } }))
    const changeName = (theName) => setEditDeviceModal(old => ({ ...old, device: { ...old.device, name: theName } }))
    const changeNotes = (theNotes) => setEditDeviceModal(old => ({ ...old, device: { ...old.device, notes: theNotes } }))

    const makeRows = () => {
        let rows = []

        for (let i = 0; i < devices.length; i++) {
            let styles = { verticalAlign: 'middle' }

            if (devices[i].status === 'DEAD') {
                styles = { ...styles, backgroundColor: '#FFA0A0' }
            } else if (devices[i].status === 'PENDING') {
                styles = { ...styles, backgroundColor: 'yellow' }
            }

            rows.push(
                <tr key={'row' + i}>
                    <td style={styles}>{devices[i].name}</td>
                    <td style={styles}>{devices[i].address}</td>
                    <td style={styles}>{devices[i].status}</td>
                    <td style={styles}>{devices[i].lastChecked}</td>
                    <td style={styles}>{devices[i].lastGood}</td>
                    <td style={styles}><Button onClick={() => window.electron.ipcRenderer.send('pingOne', devices[i])} size="sm">Ping</Button></td>
                    <td style={styles}>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => setEditDeviceModal({ show: true, device: devices[i] })}
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
            <div>
                <Table striped size="sm" hover style={{ userSelect: 'none' }} >
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
            </div>
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
                                        type="text" value={editDeviceModal.device.name}
                                        onChange={(e) => changeName(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Address:</td>
                                <td>
                                    <input
                                        style={{ width: '100%' }}
                                        type="text" value={editDeviceModal.device.address}
                                        onChange={(e) => changeAddress(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Notes:</td>
                                <td>
                                    <textarea
                                        style={{ width: '100%', fontSize: '12px' }}
                                        value={editDeviceModal.device.notes}
                                        onChange={(e) => changeNotes(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Ping Frequency:</td>
                                <td>
                                    <input type="number" min="15" max="720"
                                        value={editDeviceModal.device.frequency}
                                        onChange={(e) => changeFrequency(e.target.value)} />{" Seconds"}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'right' }}>Trys Before Email:</td>
                                <td><input type="number" min="1" max="100"
                                    value={editDeviceModal.device.trys} onChange={(e) => changeTrys(e.target.value)} /></td>
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
