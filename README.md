# Pinger - Network Monitoring Made Simple

Pinger is a desktop application that continuously monitors your network devices and instantly alerts you when something goes offline. Perfect for summer camps, offices, schools, and any organization that depends on reliable network connectivity.

## What Pinger Does

Pinger watches your critical network equipment 24/7 and sends you email alerts the moment something stops responding. Whether it's your main router, Wi-Fi access points, servers, or any networked device - you'll know immediately when there's a problem, not hours later when campers complain about no internet.

## Key Features

### Continuous Network Monitoring
- **Real-Time Monitoring**: Checks your devices every 15 seconds to 12 minutes (you choose)
- **Instant Alerts**: Get notified within seconds when equipment goes offline
- **Smart Detection**: Prevents false alarms with configurable retry attempts
- **Visual Status**: Easy-to-read dashboard shows which devices are online/offline

### Mobile-Friendly Email Alerts
- **Mobile-Optimized**: Email alerts look great on phones - no zooming or scrolling needed
- **Multiple Alert Types**: Different templates for device failures, recoveries, and extended outages
- **Location Tags**: Know exactly which building or area is affected
- **Batch Alerts**: Multiple device failures grouped into one email to avoid spam

### Easy Setup & Management
- **Simple Device Management**: Add devices by name and IP address with optional notes
- **Email Configuration**: Works with Gmail, Outlook, Yahoo, or any email provider
- **Test Everything**: Built-in testing for both network connectivity and email delivery
- **Background Operation**: Runs quietly in your system tray

### Perfect for Summer Camps
- **Multi-Building Monitoring**: Track devices across dining halls, cabins, activity centers, and admin buildings
- **Staff Notifications**: Alert counselors, IT staff, or camp directors instantly
- **Reliable Communication**: Ensure camp families can stay connected and staff can access critical systems
- **Minimal Maintenance**: Set it up once and let it run all summer

### System Features
- **Auto-Start**: Automatically begins monitoring when your computer starts
- **Always Updated**: Built-in update system keeps the software current
- **Secure**: All your data stays on your computer - no cloud services required

## System Requirements

- **Operating System**: Windows 10 or newer
- **Memory**: 4GB RAM minimum
- **Storage**: 100MB available disk space
- **Network**: Internet connection for email alerts and updates
- **Email**: Valid email account (Gmail, Outlook, Yahoo, or custom SMTP)

## Technical Details

**Built with modern technology** for reliability and performance:
- Desktop application using Electron framework
- Responsive React-based user interface
- Secure local data storage with encrypted credentials
- Multi-provider email support with mobile-optimized templates
- Automatic updates to ensure latest features and security

## Getting Started

### Installation
1. Download the latest version from the [Releases page](../../releases)
2. Run the installer and follow the setup wizard
3. Launch Pinger from your desktop or Start menu

### Quick Setup
1. **Add Your Devices**: Click "Add Device" and enter the name and IP address of each device you want to monitor
2. **Configure Email**: Go to Settings → Email Setup and enter your email credentials
3. **Test Everything**: Use the built-in test buttons to verify connectivity and email delivery
4. **Start Monitoring**: Pinger will begin watching your devices immediately

### Email Setup Details
1. **Choose Provider**: Select Gmail, Outlook, Yahoo, or enter custom SMTP settings
2. **Enter Credentials**: Use your email address and password (Gmail users need an "App Password")
3. **Add Recipients**: Enter all email addresses that should receive alerts
4. **Test Templates**: Preview and test the different alert types (Device Down, Recovery, Escalation)
5. **Configure Rules**: Set up alert timing, cooldown periods, and batch settings

**Gmail Users**: You'll need to create an "App Password" in your Google Account settings under Security → 2-Step Verification → App Passwords.

### Running 24/7
Enable "Start automatically with Windows" in Settings to ensure monitoring continues even after restarts.

## Security & Privacy

- **Local Data Storage**: All configuration data (devices, settings, credentials) is stored locally on your machine in encrypted JSON files
- **Encrypted Credentials**: SMTP passwords are encrypted using Electron's safeStorage API before being saved to disk
- **No Cloud Dependencies**: No data is sent to external services except for your configured email notifications
- **User-Controlled**: You maintain full control over your network monitoring data and email configurations

## Who Uses Pinger

**Summer Camps & Youth Organizations**
- Monitor Wi-Fi access points across cabins and activity areas
- Track dining hall POS systems and registration computers
- Ensure reliable internet for staff communication and parent updates
- Get instant alerts when the main office or health center loses connectivity

**IT Professionals & Network Administrators**
- Monitor critical servers, routers, switches, and network appliances
- Track uptime across multiple buildings or locations
- Receive immediate notification of network outages
- Maintain service level agreements with proactive monitoring

**Small Businesses & Organizations**
- Keep tabs on essential business systems and internet connectivity
- Monitor point-of-sale systems, security cameras, and office equipment
- Ensure reliable communication systems for customer service
- Prevent revenue loss from undetected network outages

## Support & Development

**Developed by WBM Tek** - Reliable software solutions for network monitoring and management.

For technical support, feature requests, or bug reports, please use the [GitHub Issues](../../issues) page.

---

### For Developers

Pinger is built with React, Electron, and TypeScript. To set up a development environment:

```bash
pnpm install
pnpm dev
```

To build for production:
```bash
pnpm package
pnpm make
```