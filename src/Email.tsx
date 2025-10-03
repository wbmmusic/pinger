export default function Email() {
    return (
        <div style={{ backgroundColor: 'lightGrey' }}>
            <div style={{ padding: '10px', display: 'inline-block' }}>
                <div>
                    <h1>Network Warning</h1>
                </div>
                <hr />
                <div style={{ marginBottom: '10px' }}>
                    <b>System:</b>{` Temp System Name`}
                </div>
                <div>
                    Device/s you are pinging stopped responding
                </div>
                <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'inline-block', backgroundColor: 'white', padding: '10px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left' }}>Name</th>
                                    <th style={{ textAlign: 'left' }}>IP</th>
                                    <th style={{ textAlign: 'left' }}>Last good ping</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ paddingRight: '20px' }}>Test Name</td>
                                    <td style={{ paddingRight: '20px' }}>123.123.234.456</td>
                                    <td style={{ paddingRight: '20px' }}>Some Date</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <hr />
                Some other information can go here
            </div>
        </div>
    );
}
