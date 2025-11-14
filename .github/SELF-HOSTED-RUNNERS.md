# Self-Hosted GitHub Actions Runners Setup

This document provides instructions for setting up and managing self-hosted GitHub Actions runners on a VPS for the YektaYar project.

## Prerequisites

- Ubuntu 20.04+ or Debian-based Linux VPS
- Minimum 2 CPU cores, 8GB RAM, 30GB storage
- Root or sudo access
- GitHub repository admin access

## Runner Requirements

The YektaYar workflows require:

- **Node.js**: Version 18 or later
- **Java**: OpenJDK 17 (for Android builds)
- **Gradle**: Installed with Android SDK
- **Android SDK**: Required for mobile app builds
- **Git**: Latest version
- **npm**: Latest version

## Setting Up a New Runner

### 1. Prepare the VPS

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y curl wget git build-essential

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version
npm --version
```

### 2. Install Java and Android SDK

```bash
# Install OpenJDK 17
sudo apt install -y openjdk-17-jdk

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
source ~/.bashrc

# Verify Java installation
java -version
```

### 3. Install Android SDK (for Android builds)

```bash
# Download Android command line tools
mkdir -p ~/android-sdk/cmdline-tools
cd ~/android-sdk/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-9477386_latest.zip
mv cmdline-tools latest

# Set Android environment variables
echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# Accept licenses and install required packages
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

### 4. Create Runner User

```bash
# Create dedicated user for GitHub Actions runner
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG sudo github-runner

# Switch to runner user
sudo su - github-runner
```

### 5. Download and Configure GitHub Actions Runner

```bash
# Create runner directory
mkdir actions-runner && cd actions-runner

# Download latest runner (check https://github.com/actions/runner/releases for latest version)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure the runner
./config.sh --url https://github.com/atomicdeploy/yektayar \
  --token YOUR_RUNNER_TOKEN \
  --name yektayar-vps-runner-01 \
  --labels self-hosted,linux,yektayar-runners \
  --work _work
```

**Note**: To get the runner token:
1. Go to repository Settings → Actions → Runners
2. Click "New self-hosted runner"
3. Copy the token from the configuration command

### 6. Install and Start Runner as Service

```bash
# Install the runner service
sudo ./svc.sh install

# Start the runner
sudo ./svc.sh start

# Check runner status
sudo ./svc.sh status
```

## Runner Labels

The runners are configured with the following labels:

- `self-hosted`: Indicates this is a self-hosted runner
- `linux`: Operating system
- `yektayar-runners`: Project-specific label for targeted workflow runs

## Workflows Using Self-Hosted Runners

### Build Android APK Workflow

The `build-android-apk.yml` workflow is configured to run on self-hosted runners:

```yaml
runs-on: [self-hosted, linux, yektayar-runners]
```

This workflow handles:
- Building debug and release APKs
- Running Android builds with Gradle
- Uploading build artifacts

### Copilot Setup Steps Workflow

The `copilot-setup-steps.yml` workflow also uses self-hosted runners:

```yaml
runs-on: yektayar-runners
```

## Monitoring and Maintenance

### Check Runner Status

```bash
# Check if runner service is running
sudo systemctl status actions.runner.*

# View runner logs
sudo journalctl -u actions.runner.* -f
```

### Update Runner

```bash
cd ~/actions-runner
sudo ./svc.sh stop
./config.sh remove --token YOUR_REMOVAL_TOKEN
# Download and extract new version
./config.sh --url https://github.com/atomicdeploy/yektayar \
  --token YOUR_NEW_TOKEN \
  --name yektayar-vps-runner-01 \
  --labels self-hosted,linux,yektayar-runners
sudo ./svc.sh install
sudo ./svc.sh start
```

### Disk Space Management

Monitor disk space regularly as builds can consume significant storage:

```bash
# Check disk usage
df -h

# Clean npm cache
npm cache clean --force

# Clean Gradle cache
rm -rf ~/.gradle/caches/

# Clean Android build outputs
find ~/actions-runner/_work -name "build" -type d -exec rm -rf {} +
```

### Troubleshooting

**Runner not connecting:**
- Verify network connectivity
- Check runner token validity
- Ensure firewall allows outbound HTTPS (443)

**Build failures:**
- Check Node.js and Java versions
- Verify Android SDK installation
- Review runner logs for specific errors
- Ensure sufficient disk space

**Performance issues:**
- Monitor CPU and memory usage with `htop`
- Consider increasing VPS resources
- Add more runners for parallel builds

## Security Considerations

- Keep runner software updated
- Use dedicated user account for runner
- Regularly update system packages
- Monitor runner logs for suspicious activity
- Limit runner access to necessary resources only
- Use runner labels to control which workflows can use the runner

## Scaling

To add more runners:

1. Provision additional VPS instances
2. Follow the setup steps above
3. Use sequential naming: `yektayar-vps-runner-02`, `yektayar-vps-runner-03`, etc.
4. Use same labels for all runners in the pool

## Support

For issues with self-hosted runners:
- Check GitHub Actions documentation: https://docs.github.com/en/actions/hosting-your-own-runners
- Review runner logs
- Contact repository maintainers

## References

- [GitHub Actions Self-hosted Runners Documentation](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Android SDK Command-line Tools](https://developer.android.com/studio/command-line)
- [Node.js Installation Guide](https://nodejs.org/en/download/package-manager/)
