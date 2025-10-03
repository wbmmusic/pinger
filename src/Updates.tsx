import React, { Fragment, useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import { UpdaterInfo } from "./types/electron";

interface DownloadSnack {
  show: boolean;
  progress: number;
}

interface InstallSnack {
  show: boolean;
  version: string;
}

export default function Updates() {
  const defaultDownloadSnack: DownloadSnack = { show: false, progress: 0 };
  const defaultInstallSnack: InstallSnack = { show: false, version: "x.x.x" };
  const [downloadSnack, setDownloadSnack] = useState<DownloadSnack>(defaultDownloadSnack);
  const [installSnack, setInstallSnack] = useState<InstallSnack>(defaultInstallSnack);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setDownloadSnack({ show: false, progress: 0 });
  };

  const install = () => window.electron.send("installUpdate");

  const closeInstallSnack = () =>
    setInstallSnack(old => ({ ...old, show: false }));

  const action = (
    <Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  const installAction = (
    <Fragment>
      <Button color="error" size="small" onClick={() => install()}>
        Relaunch App
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={closeInstallSnack}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  useEffect(() => {
    window.electron.receive("updater", (a: string, b?: UpdaterInfo) => {
      if (a === "checking-for-update") console.log("Checking For Update");
      else if (a === "update-not-available" && b)
        console.log("Up to date: v" + b.version);
      else if (a === "update-available")
        setDownloadSnack(() => ({ show: true, progress: 0 }));
      else if (a === "download-progress" && b) {
        console.log("Downloading Update", Math.round(b.percent || 0) + "%");
        setDownloadSnack(old => ({ ...old, progress: Math.round(b.percent || 0) }));
      } else if (a === "update-downloaded" && b) {
        console.log("Downloaded", b);
        setDownloadSnack(defaultDownloadSnack);
        setInstallSnack({ show: true, version: b.tag || "unknown" });
      } else if (a === "error") console.log("Update Error", b);
      else console.log(a, b);
    });

    return () => window.electron.removeListener("updater");
  }, []);

  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={downloadSnack.show}
        autoHideDuration={30000}
        onClose={handleClose}
        message={`Downloading Update ${downloadSnack.progress}%`}
        action={action}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={installSnack.show}
        autoHideDuration={30000}
        onClose={handleClose}
        message={`Relaunch to install ${installSnack.version}`}
        action={installAction}
      />
    </div>
  );
}
