import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Top from './components/Top'
import Email from './Email';
import Updates from './Updates'
var ReactDOMServer = require('react-dom/server');

function App() {

  useEffect(() => {
    window.electron.receive('message', (theMessage) => console.log(theMessage))

    window.electron.ipcRenderer.send('reactIsReady')

    window.electron.receive('makeEmailBody', () => {
      console.log("MAKE EMAIL BODY")
      window.electron.ipcRenderer.send('emailBody', ReactDOMServer.renderToString(<Email />))
    })

    return () => {
      window.electron.removeListener('reactIsReady')
      window.electron.removeListener('message')
      window.electron.removeListener('makeEmailBody')
    }
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      overflow: 'hidden'
    }}>
      <HashRouter>
        <Top />
      </HashRouter>
      <Updates />
    </div>
  );
}

export default App;
