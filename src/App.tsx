import { useEffect } from "react";
import { HashRouter } from "react-router-dom";
import Top from "./components/Top";
import Email from "./Email";
import Updates from "./Updates";
import * as ReactDOMServer from "react-dom/server";
import { ThemeProvider, useTheme } from "./theme/ThemeProvider";

function AppContent() {
  const theme = useTheme();

  useEffect(() => {
    window.electron.receive("message", (theMessage: any) => console.log(theMessage));

    window.electron.send("reactIsReady");

    window.electron.receive("makeEmailBody", () => {
      console.log("MAKE EMAIL BODY");
      window.electron.send(
        "emailBody",
        ReactDOMServer.renderToString(<Email />)
      );
    });

    return () => {
      window.electron.removeListener("reactIsReady");
      window.electron.removeListener("message");
      window.electron.removeListener("makeEmailBody");
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        overflow: "hidden",
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.primary,
      }}
    >
      <HashRouter>
        <Top />
      </HashRouter>
      <Updates />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
