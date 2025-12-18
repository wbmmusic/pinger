# Pinger

A React + Electron desktop application for continuous network monitoring and ping testing with automated email notifications. This tool provides real-time monitoring of network devices and servers with proactive alerting when equipment goes offline.

## Key Features

### Core Monitoring
- **Continuous Ping Monitoring**: Real-time monitoring of multiple network devices with configurable intervals (15-720 seconds)
- **Smart Timeout Handling**: 5-second ping timeout for faster failure detection on unreachable networks
- **Retry Logic**: Configurable retry attempts (1-100) before triggering alerts to prevent false alarms
- **Status Tracking**: Real-time status display with visual indicators (ALIVE/DEAD/PENDING)

### User Interface
- **Color-Coded Status Table**: Bootstrap table with red highlighting for failed devices, yellow for pending
- **Device Management**: Add, edit, and delete monitored devices with notes and custom settings
- **Manual Testing**: On-demand ping testing for individual devices
- **Settings Management**: Configure email recipients, subjects, and location information

### System Integration
- **System Tray Operation**: Runs in background with system tray icon and context menu
- **Auto-Launch**: Optional Windows startup integration with `--autoStart` parameter
- **Single Instance**: Prevents multiple app instances, focuses existing window when launched again
- **Close Protection**: Warning dialog prevents accidental closure, option to run in background

### Email Notifications
- **Flexible SMTP Configuration**: Support for Gmail, Outlook, Yahoo, and custom SMTP servers
- **Basic & Advanced Setup**: Simple provider selection or full SMTP control (host, port, security)
- **Connection Testing**: Built-in email configuration testing and test message sending
- **Automated Alerts**: Email notifications when devices go offline or come back online
- **Mobile-Optimized Email Templates**: Card-based layout optimized for mobile devices with no horizontal scrolling
- **Multiple Alert Types**: Device down, recovery, and escalation templates with color-coded status indicators
- **Template Preview & Testing**: Live preview of email templates with individual test email functionality
- **HTML Email Reports**: Server-side React component rendering for rich email formatting
- **Configurable Recipients**: Multiple email addresses with custom subject lines
- **Location Tagging**: Include location information in alerts for multi-site monitoring
- **Smart Triggers**: Advanced filtering with time-based rules, escalation levels, device priorities, cooldown periods, and batch notifications

### Updates & Maintenance
- **Auto-Update**: Electron auto-updater with download progress and install prompts
- **Persistent Configuration**: JSON-based config file storage in user data directory
- **Development Mode**: Vite dev server integration for development workflow

## Technical Architecture

### Frontend (React)
- **StatusTable Component**: Main monitoring interface with device status display
- **EmailTemplate Component**: Mobile-optimized HTML email templates with card-based layout
- **Settings Component**: Tabbed interface for General, Email Setup, Email Templates, and Alert Rules
- **Updates Component**: Auto-updater UI with progress indicators
- **Modal Dialogs**: Device management, settings, and confirmation dialogs

### Backend (Electron Main Process)
- **Pingable Class**: Individual device monitoring with timer management
- **IPC Communication**: Secure renderer-main process communication
- **File System**: Configuration persistence and management
- **Email Integration**: Multi-provider SMTP support (Gmail, Outlook, Yahoo, custom) with advanced trigger system

### Configuration
- **Device Storage**: JSON file with device list, settings, and preferences (saved to user data directory)
- **Email Settings**: Full SMTP configuration, recipients, and message templates
- **User Preferences**: Auto-launch, close warnings, and UI settings
- **WBM Tek Branding**: Authored by WBM Tek with configurable organization settings

## Installation & Usage

### Development
```bash
pnpm install
pnpm dev
```

### Production Build
```bash
pnpm package
pnpm make
```

### Email Setup
1. Open Settings → Email Setup
2. Select email provider (Gmail, Outlook, Yahoo, or Custom)
3. Enter email credentials (use app passwords for Gmail)
4. Configure test email address for template testing
5. Test connection and send test emails
6. Preview and test different email templates (Device Down, Recovery, Escalation)
7. Configure recipients and alert preferences in Alert Rules

### Auto-Start Setup
Enable auto-launch through the Settings menu to start monitoring on Windows boot with system tray operation.

## Security & Privacy

- **Local Data Storage**: All configuration data (devices, settings, credentials) is stored locally on your machine in encrypted JSON files
- **Encrypted Credentials**: SMTP passwords are encrypted using Electron's safeStorage API before being saved to disk
- **No Cloud Dependencies**: No data is sent to external services except for your configured email notifications
- **User-Controlled**: You maintain full control over your network monitoring data and email configurations

## Target Users

**General-purpose tool for network administrators and IT professionals** monitoring:
- **Critical Infrastructure**: Servers, routers, switches, and network appliances
- **Multi-Site Networks**: Location-based monitoring with centralized alerting
- **Service Availability**: Continuous uptime monitoring with immediate failure notification
- **Troubleshooting**: Manual ping testing and historical status tracking
- **Any Organization**: Configurable for any network environment with flexible email setup

## Dependencies

### Core Framework
- **Electron**: Desktop application framework
- **React**: Frontend UI framework
- **TypeScript**: Type-safe development

### UI Components
- **React Bootstrap**: UI component library
- **Material-UI Icons**: Icon components
- **React Router**: Navigation management

### Networking & Communication
- **ping**: Network ping functionality with 5-second timeout for fast failure detection
- **nodemailer**: Multi-provider SMTP email sending (Gmail, Outlook, Yahoo, custom)
- **date-and-time**: Timestamp formatting

### Development & Build
- **Vite**: Build tool and dev server
- **Electron Forge**: Application packaging and distribution
- **electron-updater**: Automatic update functionality

### Utilities
- **uuid**: Unique device identifier generation
- **fs**: File system operations for configuration management