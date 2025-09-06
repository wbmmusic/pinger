# Pinger

React + Electron desktop application for network monitoring and ping testing with automated email notifications. This tool continuously monitors network devices and servers, sending email alerts when equipment goes offline.

## Key Features

- **Network Monitoring**: Continuous ping monitoring of multiple network devices and servers with real-time status updates
- **Status Tracking**: Real-time status display with visual indicators (alive/dead/pending) and color-coded table rows
- **Email Notifications**: Automated email alerts using nodemailer when devices go offline or come back online
- **Device Management**: Add, edit, and delete monitored devices with configurable settings and notes
- **Ping Frequency Control**: Configurable ping intervals (15-720 seconds) per device for flexible monitoring
- **Retry Logic**: Configurable retry attempts (1-100) before triggering email alerts to prevent false alarms
- **Visual Status Table**: Bootstrap table with color-coded status indicators for quick network health assessment
- **Manual Testing**: On-demand ping testing for individual devices for troubleshooting
- **Auto-Update**: Electron auto-updater for application maintenance and feature updates
- **Email HTML Reports**: Server-side rendering of React components for rich HTML email notifications

## Architecture

Electron application with React frontend, ping monitoring system using Node.js ping library, and email notification system with nodemailer integration.

## Network Administration

Designed for network administrators and IT professionals to monitor critical network infrastructure, ensuring proactive notification of network issues and device failures.

## Dependencies

- React
- Electron
- Bootstrap
- ping
- nodemailer
- date-and-time
- electron-updater