import { useEffect } from 'react';
import Top from './components/Top'
import Updates from './Updates'

declare global {
  interface Window {
    electron: any;
  }
}

function App() {

  useEffect(() => {
    window.electron.receive('message', (e: object, theMessage: string) => {
      console.log(theMessage)
    })

    window.electron.receive('app_version', (event: object, arg: any) => {
      window.electron.ipcRenderer.removeAllListeners('app_version');
      document.title = 'nubar-ping --- v' + arg.version;
    });

    window.electron.ipcRenderer.send('reactIsReady')

    return () => {
      window.electron.ipcRenderer.removeAllListeners('reactIsReady')
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
      <Top />
      <Updates />
    </div>
  );
}

export default App;
