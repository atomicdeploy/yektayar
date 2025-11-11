# Email Server Setup Guide

This guide covers the setup and configuration of the YektaYar email server, including Postfix, Dovecot, RoundCube, and PostfixAdmin.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [DNS Configuration](#dns-configuration)
5. [PostfixAdmin Setup](#postfixadmin-setup)
6. [Webmail Access](#webmail-access)
7. [Backend Integration](#backend-integration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Overview

The YektaYar email server stack includes:

- **Postfix**: SMTP server for sending and receiving emails
- **Dovecot**: IMAP/POP3 server for email retrieval
- **OpenDKIM**: Email authentication using DKIM signatures
- **PostfixAdmin**: Web-based administration interface
- **RoundCube**: Modern webmail interface
- **PostgreSQL**: Database backend for all email services

### Email Infrastructure

- **Domain**: yektayar.ir
- **Mail Server**: mail.yektayar.ir
- **Webmail**: webmail.yektayar.ir
- **Admin Panel**: postfixadmin.yektayar.ir
- **Default Account**: info@yektayar.ir (catch-all)

## Prerequisites

Before running the installation script, ensure:

1. **Server Requirements**:
   - Ubuntu 20.04+ or Debian 11+
   - Root or sudo access
   - Minimum 2GB RAM
   - 20GB available disk space

2. **DNS Access**:
   - Ability to add/modify DNS records for yektayar.ir
   - Control over A, MX, TXT records

3. **SSL Certificates**:
   - Let's Encrypt certificates must be installed at `/etc/letsencrypt/live/yektayar.ir/`
   - Run certbot first if certificates don't exist

4. **PostgreSQL**:
   - PostgreSQL 15+ must be installed
   - Run `./scripts/setup-postgresql.sh` first if not installed

5. **Firewall**:
   - Ensure the following ports are open:
     - 25 (SMTP)
     - 587 (Submission/STARTTLS)
     - 465 (SMTPS)
     - 993 (IMAPS)
     - 143 (IMAP)
     - 995 (POP3S)
     - 110 (POP3)
     - 80 (HTTP)
     - 443 (HTTPS)

## Installation

### Step 1: Run the Installation Script

```bash
# Navigate to project root
cd /path/to/yektayar

# Run the email server setup script
sudo ./scripts/setup-email-server.sh
```

The script will:
1. Verify SSL certificates
2. Create mail database and user
3. Install Postfix, Dovecot, Apache, PHP
4. Configure SMTP/IMAP/POP3 services
5. Install and configure OpenDKIM
6. Download and setup PostfixAdmin
7. Download and setup RoundCube
8. Create virtual hosts for webmail and admin panel
9. Generate DKIM keys
10. Create configuration files

### Step 2: Review Credentials

After installation, review the generated credentials:

```bash
cat email-server-credentials.txt
```

**Important**: Change the default password for info@yektayar.ir immediately!

## DNS Configuration

### Required DNS Records

Run the DNS setup helper script to see required records:

```bash
./scripts/setup-email-dns-records.sh
```

### Manual DNS Setup

Add the following records to your DNS provider:

#### 1. MX Record (Mail Exchange)

```
Type: MX
Name: @
Value: mail.yektayar.ir
Priority: 10
TTL: 3600
```

#### 2. A Records

```
# Mail server
Type: A
Name: mail
Value: [YOUR_SERVER_IP]
TTL: 3600

# Webmail
Type: A
Name: webmail
Value: [YOUR_SERVER_IP]
TTL: 3600

# PostfixAdmin
Type: A
Name: postfixadmin
Value: [YOUR_SERVER_IP]
TTL: 3600
```

#### 3. SPF Record (Sender Policy Framework)

```
Type: TXT
Name: @
Value: v=spf1 mx a:mail.yektayar.ir ip4:[YOUR_SERVER_IP] -all
TTL: 3600
```

#### 4. DKIM Record (DomainKeys Identified Mail)

```
Type: TXT
Name: mail._domainkey
Value: [Copy from /etc/opendkim/keys/yektayar.ir/mail.txt]
TTL: 3600
```

To get your DKIM public key:

```bash
sudo cat /etc/opendkim/keys/yektayar.ir/mail.txt
```

Remove quotes and line breaks, keep only the key value.

#### 5. DMARC Record

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yektayar.ir; ruf=mailto:dmarc@yektayar.ir; fo=1
TTL: 3600
```

#### 6. Reverse DNS (PTR Record)

Contact your hosting provider to set up reverse DNS:

```
[YOUR_SERVER_IP] → mail.yektayar.ir
```

### DNS Propagation

After adding DNS records:
- Wait 15-30 minutes for propagation
- Run verification script: `./scripts/verify-email-setup.sh`
- Check DNS with: `dig MX yektayar.ir +short`

## PostfixAdmin Setup

### Initial Setup

1. **Access Setup Wizard**:
   ```
   https://postfixadmin.yektayar.ir/setup.php
   ```

2. **Create Setup Password**:
   - Enter a secure setup password
   - Copy the generated hash
   - Edit config file:
     ```bash
     sudo nano /var/www/postfixadmin.yektayar.ir/config.local.php
     ```
   - Add line: `$CONF['setup_password'] = 'YOUR_HASH_HERE';`

3. **Create Super Admin**:
   - Return to setup page
   - Enter setup password
   - Create admin account (use info@yektayar.ir)
   - Set admin password

4. **Login to Admin Panel**:
   ```
   https://postfixadmin.yektayar.ir/login.php
   ```

### Managing Email Accounts

#### Create a Mailbox

1. Login to PostfixAdmin
2. Go to "Virtual List" → "Add Mailbox"
3. Fill in details:
   - Email address
   - Password
   - Name
   - Quota (default: 1GB)
4. Click "Add Mailbox"

#### Create Email Alias

1. Go to "Virtual List" → "Add Alias"
2. Enter:
   - Alias address
   - Destination address(es)
3. Click "Add Alias"

#### Manage Domains

1. Go to "Domain List"
2. Click domain name to manage
3. View statistics and settings
4. Set quotas and limits

## Webmail Access

### RoundCube Login

1. **Access Webmail**:
   ```
   https://webmail.yektayar.ir
   ```

2. **Login Credentials**:
   - Username: Full email address (e.g., info@yektayar.ir)
   - Password: Your mailbox password

3. **Change Password**:
   - Click Settings (gear icon)
   - Go to Password section
   - Change your default password

### Email Client Configuration

#### IMAP Settings

```
Server: mail.yektayar.ir
Port: 993
Security: SSL/TLS
Username: your-email@yektayar.ir
Password: your-password
```

#### SMTP Settings

```
Server: mail.yektayar.ir
Port: 587 (STARTTLS) or 465 (SSL/TLS)
Security: STARTTLS or SSL/TLS
Authentication: Required
Username: your-email@yektayar.ir
Password: your-password
```

## Backend Integration

### Environment Configuration

Update `packages/backend/.env`:

```env
# Email Configuration
SMTP_HOST=mail.yektayar.ir
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@yektayar.ir
SMTP_PASSWORD=your_email_password
EMAIL_FROM=YektaYar <info@yektayar.ir>
```

### Install Dependencies

```bash
cd packages/backend
bun install nodemailer
bun install -D @types/nodemailer
```

### Using Email Service

```typescript
import { 
  sendRegistrationEmail,
  sendPasswordResetEmail,
  sendAppointmentConfirmationEmail,
  testEmailConnection
} from './services/emailService'

// Test connection
const test = await testEmailConnection()
if (test.success) {
  console.log('Email server connected')
}

// Send registration email
await sendRegistrationEmail(
  'user@example.com',
  'John Doe',
  '123456'
)

// Send password reset
await sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'RESET123'
)

// Send appointment confirmation
await sendAppointmentConfirmationEmail(
  'user@example.com',
  'John Doe',
  {
    date: '1403/08/20',
    time: '14:00',
    psychologistName: 'دکتر احمدی',
    type: 'آنلاین'
  }
)
```

## Testing

### Verify Setup

Run the verification script:

```bash
sudo ./scripts/verify-email-setup.sh
```

This checks:
- DNS records (MX, SPF, DKIM, DMARC)
- Service status (Postfix, Dovecot, OpenDKIM)
- Port accessibility
- SSL certificates
- Database configuration
- Web access

### Send Test Email

#### Via Command Line

```bash
echo "Test email body" | mail -s "Test Subject" recipient@example.com
```

#### Via Webmail

1. Login to https://webmail.yektayar.ir
2. Compose new message
3. Send to external email address
4. Check if received

#### Via Backend

```bash
cd packages/backend
bun run src/index.ts

# Then test email endpoint
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","text":"Hello"}'
```

### Check Email Deliverability

Use these online tools:

1. **Mail Tester**: https://www.mail-tester.com/
   - Send email to provided address
   - Get spam score and recommendations

2. **MX Toolbox**: https://mxtoolbox.com/SuperTool.aspx
   - Check all DNS records
   - Verify server configuration
   - Test blacklist status

3. **DKIM Validator**: https://dkimvalidator.com/
   - Send email to provided address
   - Verify DKIM signature

## Troubleshooting

### Common Issues

#### 1. Email Not Sending

**Check Postfix status:**
```bash
sudo systemctl status postfix
sudo journalctl -u postfix -f
```

**Check mail queue:**
```bash
sudo mailq
sudo postqueue -f
```

**Test SMTP:**
```bash
telnet localhost 25
# Type: EHLO localhost
# Then: QUIT
```

#### 2. Email Not Receiving

**Check Dovecot status:**
```bash
sudo systemctl status dovecot
sudo journalctl -u dovecot -f
```

**Check mailbox permissions:**
```bash
ls -la /var/mail/vhosts/yektayar.ir/
```

**Test IMAP:**
```bash
telnet localhost 143
# Type: a1 LOGIN info@yektayar.ir password
# Then: a2 LOGOUT
```

#### 3. DKIM Not Working

**Test DKIM key:**
```bash
sudo opendkim-testkey -d yektayar.ir -s mail -vvv
```

**Check OpenDKIM status:**
```bash
sudo systemctl status opendkim
sudo journalctl -u opendkim -f
```

**Verify DNS record:**
```bash
dig mail._domainkey.yektayar.ir TXT +short
```

#### 4. Webmail Not Accessible

**Check Apache status:**
```bash
sudo systemctl status apache2
sudo journalctl -u apache2 -f
```

**Check virtual host:**
```bash
sudo apache2ctl -S | grep webmail
```

**Check logs:**
```bash
sudo tail -f /var/log/apache2/webmail.yektayar.ir-error.log
```

#### 5. PostfixAdmin Database Error

**Check database connection:**
```bash
sudo -u postgres psql -d yektayar_mail -c "SELECT * FROM domain;"
```

**Check permissions:**
```bash
sudo -u postgres psql -c "\du mail_admin"
```

### Log Files

Important log files to check:

```bash
# Mail logs
sudo tail -f /var/log/mail.log
sudo tail -f /var/log/mail.err

# Postfix logs
sudo journalctl -u postfix -f

# Dovecot logs
sudo journalctl -u dovecot -f

# OpenDKIM logs
sudo journalctl -u opendkim -f

# Apache logs
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/webmail.yektayar.ir-error.log
sudo tail -f /var/log/apache2/postfixadmin.yektayar.ir-error.log
```

### Service Management

```bash
# Restart all email services
sudo systemctl restart postfix dovecot opendkim apache2

# Check service status
sudo systemctl status postfix
sudo systemctl status dovecot
sudo systemctl status opendkim
sudo systemctl status apache2

# Enable services on boot
sudo systemctl enable postfix dovecot opendkim apache2
```

### Port Conflicts

If ports are already in use:

```bash
# Check what's using port 25
sudo lsof -i :25

# Check all listening ports
sudo netstat -tulpn | grep LISTEN
```

### Firewall Configuration

If using UFW:

```bash
sudo ufw allow 25/tcp
sudo ufw allow 587/tcp
sudo ufw allow 465/tcp
sudo ufw allow 993/tcp
sudo ufw allow 143/tcp
sudo ufw allow 995/tcp
sudo ufw allow 110/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## Security Best Practices

1. **Change Default Passwords**:
   - Change info@yektayar.ir password immediately
   - Use strong passwords for all accounts

2. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade
   ```

3. **Monitor Logs**:
   - Check mail logs regularly
   - Set up log monitoring alerts

4. **Backup**:
   - Backup mail database regularly
   - Backup `/var/mail/vhosts` directory
   - Backup configuration files

5. **SSL Certificates**:
   - Ensure certbot auto-renewal is working
   - Test renewal: `sudo certbot renew --dry-run`

6. **Spam Protection**:
   - Monitor mail queue for spam
   - Consider adding SpamAssassin
   - Use fail2ban for brute force protection

7. **Rate Limiting**:
   - Configure Postfix rate limits
   - Monitor for unusual activity

## Maintenance

### Regular Tasks

1. **Daily**:
   - Check mail queue
   - Review error logs

2. **Weekly**:
   - Check disk space
   - Review spam reports

3. **Monthly**:
   - Update packages
   - Backup configuration
   - Test email deliverability

### Backup Commands

```bash
# Backup database
sudo -u postgres pg_dump yektayar_mail > mail_backup_$(date +%Y%m%d).sql

# Backup mail directory
sudo tar -czf mail_backup_$(date +%Y%m%d).tar.gz /var/mail/vhosts/

# Backup configuration
sudo tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  /etc/postfix/ \
  /etc/dovecot/ \
  /etc/opendkim/ \
  /var/www/postfixadmin.yektayar.ir/config.local.php \
  /var/www/webmail.yektayar.ir/config/config.inc.php
```

## Support

For issues or questions:

- Check logs first
- Review this documentation
- Search for error messages online
- Contact system administrator

## Additional Resources

- [Postfix Documentation](http://www.postfix.org/documentation.html)
- [Dovecot Documentation](https://doc.dovecot.org/)
- [PostfixAdmin Documentation](https://github.com/postfixadmin/postfixadmin/wiki)
- [RoundCube Documentation](https://github.com/roundcube/roundcubemail/wiki)
- [OpenDKIM Documentation](http://www.opendkim.org/)

---

**Last Updated**: 2024-11-11  
**Version**: 1.0.0
