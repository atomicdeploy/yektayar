#!/bin/bash

# YektaYar Email Server Setup Script
# This script installs and configures Postfix, Dovecot, RoundCube, and PostfixAdmin
# for email services on yektayar.ir domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration variables
DOMAIN="${DOMAIN:-yektayar.ir}"
HOSTNAME="${HOSTNAME:-mail.yektayar.ir}"
ADMIN_EMAIL="${ADMIN_EMAIL:-info@yektayar.ir}"
WEBMAIL_SUBDOMAIN="${WEBMAIL_SUBDOMAIN:-webmail.yektayar.ir}"
POSTFIXADMIN_SUBDOMAIN="${POSTFIXADMIN_SUBDOMAIN:-postfixadmin.yektayar.ir}"

# Database configuration
DB_NAME="${DB_NAME:-yektayar_mail}"
DB_USER="${DB_USER:-mail_admin}"
DB_PASSWORD="${DB_PASSWORD:-}"

# SSL Certificate paths
SSL_CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
SSL_KEY_PATH="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         YektaYar Email Server Setup Script                ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║  Installing: Postfix, Dovecot, RoundCube, PostfixAdmin    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}▶ $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
}

# Function to print info messages
print_info() {
    echo -e "${YELLOW}➜${NC} $1"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error messages and exit
print_error() {
    echo -e "${RED}✗ Error: $1${NC}"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "This script must be run as root (use sudo)"
fi

# Check if running on Ubuntu/Debian
if [ ! -f /etc/debian_version ]; then
    print_error "This script is designed for Ubuntu/Debian systems only"
fi

# Verify SSL certificates exist
print_section "Verifying SSL Certificates"

if [ ! -f "$SSL_CERT_PATH" ]; then
    print_error "SSL certificate not found at: $SSL_CERT_PATH\nPlease run certbot first to obtain certificates for $DOMAIN"
fi

if [ ! -f "$SSL_KEY_PATH" ]; then
    print_error "SSL private key not found at: $SSL_KEY_PATH"
fi

print_success "SSL certificates found"
print_info "Certificate: $SSL_CERT_PATH"
print_info "Private Key: $SSL_KEY_PATH"

# Generate database password if not provided
if [ -z "$DB_PASSWORD" ]; then
    print_section "Generating Database Password"
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    print_info "Generated secure password for mail database"
fi

# Check PostgreSQL installation
print_section "Checking PostgreSQL"

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed. Please run ./scripts/setup-postgresql.sh first"
fi

print_success "PostgreSQL is available"

# Create mail database and user
print_section "Creating Mail Database"

print_info "Creating database '$DB_NAME' and user '$DB_USER'..."

SQL_COMMANDS=$(cat <<EOF
-- Create mail database
SELECT 'CREATE DATABASE $DB_NAME' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Create mail user
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF
)

echo "$SQL_COMMANDS" | sudo -u postgres psql

print_success "Mail database created"

# Update package lists
print_section "Updating System Packages"
apt update
print_success "Package lists updated"

# Install Postfix
print_section "Installing Postfix (SMTP Server)"

# Pre-configure Postfix to avoid interactive prompts
echo "postfix postfix/main_mailer_type select Internet Site" | debconf-set-selections
echo "postfix postfix/mailname string $HOSTNAME" | debconf-set-selections

apt install -y postfix postfix-pgsql

print_success "Postfix installed"

# Install Dovecot
print_section "Installing Dovecot (IMAP/POP3 Server)"

apt install -y dovecot-core dovecot-imapd dovecot-pop3d dovecot-lmtpd dovecot-pgsql

print_success "Dovecot installed"

# Install required packages for webmail and admin
print_section "Installing Web Server and PHP"

apt install -y apache2 php php-common php-cli php-fpm php-json php-pdo php-pgsql \
    php-imap php-mbstring php-xml php-curl php-zip php-gd php-intl \
    php-imagick php-bcmath libapache2-mod-php

print_success "Apache and PHP installed"

# Enable required Apache modules
a2enmod rewrite ssl headers
systemctl restart apache2

print_success "Apache modules enabled"

# Configure Postfix
print_section "Configuring Postfix"

# Backup original configuration
cp /etc/postfix/main.cf /etc/postfix/main.cf.backup.$(date +%Y%m%d_%H%M%S)

# Create Postfix configuration
cat > /etc/postfix/main.cf <<EOF
# Basic settings
myhostname = $HOSTNAME
mydomain = $DOMAIN
myorigin = \$mydomain
mydestination = localhost
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
inet_interfaces = all
inet_protocols = ipv4

# Virtual domains and users (PostgreSQL)
virtual_mailbox_domains = $DOMAIN
virtual_mailbox_base = /var/mail/vhosts
virtual_mailbox_maps = pgsql:/etc/postfix/pgsql-virtual-mailbox-maps.cf
virtual_alias_maps = pgsql:/etc/postfix/pgsql-virtual-alias-maps.cf
virtual_alias_domains = pgsql:/etc/postfix/pgsql-virtual-alias-domains.cf
virtual_uid_maps = static:5000
virtual_gid_maps = static:5000

# SSL/TLS settings
smtpd_tls_cert_file = $SSL_CERT_PATH
smtpd_tls_key_file = $SSL_KEY_PATH
smtpd_tls_security_level = may
smtpd_tls_auth_only = yes
smtpd_tls_loglevel = 1
smtpd_tls_received_header = yes
smtpd_tls_session_cache_database = btree:\${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:\${data_directory}/smtp_scache

# SMTP settings
smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination
smtpd_recipient_restrictions = permit_mynetworks, permit_sasl_authenticated, reject_unauth_destination
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes

# Message size limit (50MB)
message_size_limit = 52428800

# Mailbox size limit (1GB)
mailbox_size_limit = 1073741824

# Local delivery via Dovecot LMTP
virtual_transport = lmtp:unix:private/dovecot-lmtp

# Additional security
smtpd_helo_required = yes
disable_vrfy_command = yes
smtpd_delay_reject = yes
smtpd_helo_restrictions = permit_mynetworks, reject_invalid_helo_hostname, permit
smtpd_sender_restrictions = permit_mynetworks, permit_sasl_authenticated

# Milter for DKIM (will be configured later)
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:127.0.0.1:8891
non_smtpd_milters = inet:127.0.0.1:8891
EOF

print_success "Postfix main configuration created"

# Create virtual mailbox directory
mkdir -p /var/mail/vhosts/$DOMAIN
groupadd -g 5000 vmail 2>/dev/null || true
useradd -g vmail -u 5000 vmail -d /var/mail/vhosts -m 2>/dev/null || true
chown -R vmail:vmail /var/mail/vhosts
chmod -R 770 /var/mail/vhosts

print_success "Virtual mailbox directory created"

# Create Postfix PostgreSQL configuration files
cat > /etc/postfix/pgsql-virtual-mailbox-maps.cf <<EOF
hosts = localhost
user = $DB_USER
password = $DB_PASSWORD
dbname = $DB_NAME
query = SELECT maildir FROM mailbox WHERE username='%s' AND active = true
EOF

cat > /etc/postfix/pgsql-virtual-alias-maps.cf <<EOF
hosts = localhost
user = $DB_USER
password = $DB_PASSWORD
dbname = $DB_NAME
query = SELECT goto FROM alias WHERE address='%s' AND active = true
EOF

cat > /etc/postfix/pgsql-virtual-alias-domains.cf <<EOF
hosts = localhost
user = $DB_USER
password = $DB_PASSWORD
dbname = $DB_NAME
query = SELECT domain FROM domain WHERE domain='%s' AND active = true
EOF

chmod 640 /etc/postfix/pgsql-*.cf
chown root:postfix /etc/postfix/pgsql-*.cf

print_success "Postfix PostgreSQL configuration files created"

# Configure Postfix master.cf for submission port
print_info "Configuring submission ports..."

cat >> /etc/postfix/master.cf <<EOF

# Submission port (587) with authentication
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_reject_unlisted_recipient=no
  -o smtpd_relay_restrictions=permit_sasl_authenticated,reject
  -o milter_macro_daemon_name=ORIGINATING

# Submissions port (465) with authentication
smtps     inet  n       -       y       -       -       smtpd
  -o syslog_name=postfix/smtps
  -o smtpd_tls_wrappermode=yes
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_reject_unlisted_recipient=no
  -o smtpd_relay_restrictions=permit_sasl_authenticated,reject
  -o milter_macro_daemon_name=ORIGINATING
EOF

print_success "Submission ports configured"

# Configure Dovecot
print_section "Configuring Dovecot"

# Backup original configuration
cp /etc/dovecot/dovecot.conf /etc/dovecot/dovecot.conf.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Main Dovecot configuration
cat > /etc/dovecot/dovecot.conf <<EOF
# Enable protocols
protocols = imap pop3 lmtp

# Listen on all interfaces
listen = *, ::

# Mail location
mail_location = maildir:/var/mail/vhosts/%d/%n

# SSL configuration
ssl = required
ssl_cert = <$SSL_CERT_PATH
ssl_key = <$SSL_KEY_PATH
ssl_min_protocol = TLSv1.2

# Authentication
auth_mechanisms = plain login

# Include configuration files
!include conf.d/*.conf
EOF

# Configure Dovecot authentication
cat > /etc/dovecot/conf.d/10-auth.conf <<EOF
# Authentication mechanisms
auth_mechanisms = plain login

# Disable system users
!include auth-system.conf.ext

# Enable PostgreSQL authentication
!include auth-sql.conf.ext
EOF

# Configure Dovecot SQL authentication
cat > /etc/dovecot/dovecot-sql.conf.ext <<EOF
driver = pgsql
connect = host=localhost dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD
default_pass_scheme = SHA512-CRYPT

password_query = SELECT email as user, password FROM mailbox WHERE email='%u' AND active = true
user_query = SELECT '/var/mail/vhosts/%d/%n' as home, 'maildir:/var/mail/vhosts/%d/%n' as mail, 5000 AS uid, 5000 AS gid FROM mailbox WHERE email='%u' AND active = true
EOF

chmod 640 /etc/dovecot/dovecot-sql.conf.ext
chown root:dovecot /etc/dovecot/dovecot-sql.conf.ext

cat > /etc/dovecot/conf.d/auth-sql.conf.ext <<EOF
passdb {
  driver = sql
  args = /etc/dovecot/dovecot-sql.conf.ext
}

userdb {
  driver = sql
  args = /etc/dovecot/dovecot-sql.conf.ext
}
EOF

print_success "Dovecot authentication configured"

# Configure Dovecot LMTP
cat > /etc/dovecot/conf.d/10-master.conf <<EOF
service imap-login {
  inet_listener imap {
    port = 143
  }
  inet_listener imaps {
    port = 993
    ssl = yes
  }
}

service pop3-login {
  inet_listener pop3 {
    port = 110
  }
  inet_listener pop3s {
    port = 995
    ssl = yes
  }
}

service lmtp {
  unix_listener /var/spool/postfix/private/dovecot-lmtp {
    mode = 0600
    user = postfix
    group = postfix
  }
}

service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0660
    user = postfix
    group = postfix
  }
  
  unix_listener auth-userdb {
    mode = 0600
    user = vmail
  }
  
  user = dovecot
}

service auth-worker {
  user = vmail
}
EOF

print_success "Dovecot services configured"

# Configure Dovecot mail settings
cat > /etc/dovecot/conf.d/10-mail.conf <<EOF
mail_location = maildir:/var/mail/vhosts/%d/%n
mail_privileged_group = vmail
mail_uid = vmail
mail_gid = vmail

namespace inbox {
  inbox = yes
  
  mailbox Drafts {
    special_use = \Drafts
    auto = subscribe
  }
  mailbox Junk {
    special_use = \Junk
    auto = subscribe
  }
  mailbox Trash {
    special_use = \Trash
    auto = subscribe
  }
  mailbox Sent {
    special_use = \Sent
    auto = subscribe
  }
}
EOF

print_success "Dovecot mail location configured"

# Install OpenDKIM for DKIM signing
print_section "Installing and Configuring DKIM"

apt install -y opendkim opendkim-tools

# Create DKIM directory structure
mkdir -p /etc/opendkim/keys/$DOMAIN
chown -R opendkim:opendkim /etc/opendkim
chmod 750 /etc/opendkim

# Generate DKIM keys
print_info "Generating DKIM keys..."
cd /etc/opendkim/keys/$DOMAIN
opendkim-genkey -b 2048 -d $DOMAIN -s mail
chown opendkim:opendkim mail.private mail.txt
chmod 600 mail.private

print_success "DKIM keys generated"

# Configure OpenDKIM
cat > /etc/opendkim.conf <<EOF
# DKIM Configuration for $DOMAIN
Syslog yes
SyslogSuccess yes
LogWhy yes

# User and group
UserID opendkim:opendkim

# Socket configuration
Socket inet:8891@localhost

# Domain configuration
Domain $DOMAIN
KeyFile /etc/opendkim/keys/$DOMAIN/mail.private
Selector mail

# Security settings
Mode sv
SubDomains no
Canonicalization relaxed/simple
AutoRestart yes
AutoRestartRate 10/1h
Background yes

# Signing and verification
InternalHosts /etc/opendkim/TrustedHosts
ExternalIgnoreList /etc/opendkim/TrustedHosts
SignatureAlgorithm rsa-sha256

# Additional security
RequireSafeKeys yes
EOF

# Create trusted hosts file
cat > /etc/opendkim/TrustedHosts <<EOF
127.0.0.1
localhost
$DOMAIN
*.$DOMAIN
EOF

chown opendkim:opendkim /etc/opendkim/TrustedHosts

print_success "OpenDKIM configured"

# Create database schema for PostfixAdmin
print_section "Setting up Database Schema"

print_info "Creating database schema for PostfixAdmin..."

sudo -u postgres psql -d $DB_NAME <<'EOSQL'
-- Create domain table
CREATE TABLE IF NOT EXISTS domain (
    domain VARCHAR(255) NOT NULL PRIMARY KEY,
    description VARCHAR(255) NOT NULL DEFAULT '',
    aliases INTEGER NOT NULL DEFAULT 0,
    mailboxes INTEGER NOT NULL DEFAULT 0,
    maxquota BIGINT NOT NULL DEFAULT 0,
    quota BIGINT NOT NULL DEFAULT 0,
    transport VARCHAR(255) NOT NULL DEFAULT 'virtual',
    backupmx BOOLEAN NOT NULL DEFAULT FALSE,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create mailbox table
CREATE TABLE IF NOT EXISTS mailbox (
    username VARCHAR(255) NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT '',
    maildir VARCHAR(255) NOT NULL,
    quota BIGINT NOT NULL DEFAULT 0,
    local_part VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (domain) REFERENCES domain(domain) ON DELETE CASCADE
);

-- Create alias table
CREATE TABLE IF NOT EXISTS alias (
    address VARCHAR(255) NOT NULL PRIMARY KEY,
    goto TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (domain) REFERENCES domain(domain) ON DELETE CASCADE
);

-- Create admin table for PostfixAdmin
CREATE TABLE IF NOT EXISTS admin (
    username VARCHAR(255) NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create domain_admins table
CREATE TABLE IF NOT EXISTS domain_admins (
    username VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (username, domain),
    FOREIGN KEY (domain) REFERENCES domain(domain) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS mailbox_domain_idx ON mailbox(domain);
CREATE INDEX IF NOT EXISTS alias_domain_idx ON alias(domain);
CREATE INDEX IF NOT EXISTS mailbox_active_idx ON mailbox(active);
CREATE INDEX IF NOT EXISTS alias_active_idx ON alias(active);
CREATE INDEX IF NOT EXISTS domain_active_idx ON domain(active);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mail_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mail_admin;

EOSQL

print_success "Database schema created"

# Insert default domain and admin mailbox
print_info "Creating default domain and mailbox..."

# Generate password hash for info@yektayar.ir (default password: yektayar2024)
DEFAULT_PASSWORD_HASH=$(doveadm pw -s SHA512-CRYPT -p "yektayar2024")

sudo -u postgres psql -d $DB_NAME <<EOSQL
-- Insert domain
INSERT INTO domain (domain, description, maxquota, transport, active)
VALUES ('$DOMAIN', 'YektaYar Mail Domain', 10737418240, 'virtual', TRUE)
ON CONFLICT (domain) DO NOTHING;

-- Insert info@yektayar.ir mailbox
INSERT INTO mailbox (username, password, name, maildir, quota, local_part, domain, email, active)
VALUES (
    '$ADMIN_EMAIL',
    '$DEFAULT_PASSWORD_HASH',
    'YektaYar Info',
    '$DOMAIN/info/',
    1073741824,
    'info',
    '$DOMAIN',
    '$ADMIN_EMAIL',
    TRUE
)
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    maildir = EXCLUDED.maildir;

-- Create catch-all alias
INSERT INTO alias (address, goto, domain, active)
VALUES ('@$DOMAIN', '$ADMIN_EMAIL', '$DOMAIN', TRUE)
ON CONFLICT (address) DO UPDATE SET
    goto = EXCLUDED.goto;

EOSQL

print_success "Default domain and mailbox created"
print_info "Email: $ADMIN_EMAIL"
print_info "Default Password: yektayar2024 (CHANGE THIS!)"

# Download and install PostfixAdmin
print_section "Installing PostfixAdmin"

cd /tmp
POSTFIXADMIN_VERSION="3.3.13"
wget "https://github.com/postfixadmin/postfixadmin/archive/postfixadmin-${POSTFIXADMIN_VERSION}.tar.gz" -O postfixadmin.tar.gz
tar -xzf postfixadmin.tar.gz
mv "postfixadmin-postfixadmin-${POSTFIXADMIN_VERSION}" postfixadmin
mkdir -p /var/www/$POSTFIXADMIN_SUBDOMAIN
cp -r postfixadmin/* /var/www/$POSTFIXADMIN_SUBDOMAIN/
chown -R www-data:www-data /var/www/$POSTFIXADMIN_SUBDOMAIN
rm -rf postfixadmin postfixadmin.tar.gz

# Create PostfixAdmin templates_c directory
mkdir -p /var/www/$POSTFIXADMIN_SUBDOMAIN/templates_c
chown -R www-data:www-data /var/www/$POSTFIXADMIN_SUBDOMAIN/templates_c

print_success "PostfixAdmin files installed"

# Configure PostfixAdmin
cat > /var/www/$POSTFIXADMIN_SUBDOMAIN/config.local.php <<EOF
<?php
\$CONF['configured'] = true;
\$CONF['database_type'] = 'pgsql';
\$CONF['database_host'] = 'localhost';
\$CONF['database_user'] = '$DB_USER';
\$CONF['database_password'] = '$DB_PASSWORD';
\$CONF['database_name'] = '$DB_NAME';

\$CONF['admin_email'] = '$ADMIN_EMAIL';
\$CONF['smtp_server'] = 'localhost';
\$CONF['smtp_port'] = '25';

\$CONF['encrypt'] = 'dovecot:SHA512-CRYPT';
\$CONF['domain_path'] = 'YES';
\$CONF['domain_in_mailbox'] = 'NO';

\$CONF['page_size'] = '50';
\$CONF['default_aliases'] = array (
  'abuse' => '$ADMIN_EMAIL',
  'hostmaster' => '$ADMIN_EMAIL',
  'postmaster' => '$ADMIN_EMAIL',
  'webmaster' => '$ADMIN_EMAIL'
);

\$CONF['quota'] = 'YES';
\$CONF['quota_multiplier'] = '1024000';

\$CONF['show_footer_text'] = 'YES';
\$CONF['footer_text'] = 'Return to yektayar.ir';
\$CONF['footer_link'] = 'https://$DOMAIN';
?>
EOF

chown www-data:www-data /var/www/$POSTFIXADMIN_SUBDOMAIN/config.local.php

print_success "PostfixAdmin configured"

# Download and install RoundCube
print_section "Installing RoundCube Webmail"

cd /tmp
ROUNDCUBE_VERSION="1.6.9"
wget "https://github.com/roundcube/roundcubemail/releases/download/${ROUNDCUBE_VERSION}/roundcubemail-${ROUNDCUBE_VERSION}-complete.tar.gz" -O roundcube.tar.gz
tar -xzf roundcube.tar.gz
mkdir -p /var/www/$WEBMAIL_SUBDOMAIN
cp -r "roundcubemail-${ROUNDCUBE_VERSION}"/* /var/www/$WEBMAIL_SUBDOMAIN/
chown -R www-data:www-data /var/www/$WEBMAIL_SUBDOMAIN
rm -rf "roundcubemail-${ROUNDCUBE_VERSION}" roundcube.tar.gz

print_success "RoundCube files installed"

# Create RoundCube database
print_info "Creating RoundCube database..."

ROUNDCUBE_DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

sudo -u postgres psql <<EOSQL
CREATE DATABASE roundcube;
CREATE USER roundcube WITH ENCRYPTED PASSWORD '$ROUNDCUBE_DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE roundcube TO roundcube;
ALTER DATABASE roundcube OWNER TO roundcube;
EOSQL

# Initialize RoundCube database schema
sudo -u postgres psql roundcube < /var/www/$WEBMAIL_SUBDOMAIN/SQL/postgres.initial.sql

print_success "RoundCube database created"

# Configure RoundCube
cat > /var/www/$WEBMAIL_SUBDOMAIN/config/config.inc.php <<EOF
<?php
\$config = array();

// Database
\$config['db_dsnw'] = 'pgsql://roundcube:$ROUNDCUBE_DB_PASSWORD@localhost/roundcube';

// IMAP
\$config['imap_host'] = 'ssl://$HOSTNAME:993';
\$config['imap_auth_type'] = null;
\$config['imap_delimiter'] = '/';

// SMTP
\$config['smtp_host'] = 'tls://$HOSTNAME:587';
\$config['smtp_auth_type'] = 'LOGIN';
\$config['smtp_user'] = '%u';
\$config['smtp_pass'] = '%p';

// System
\$config['des_key'] = '$(openssl rand -base64 24)';
\$config['product_name'] = 'YektaYar Webmail';
\$config['useragent'] = 'YektaYar Webmail';
\$config['support_url'] = 'https://$DOMAIN';

// Plugins
\$config['plugins'] = array('archive', 'zipdownload');

// User interface
\$config['language'] = 'fa_IR';
\$config['skin'] = 'elastic';
\$config['timezone'] = 'Asia/Tehran';

// Security
\$config['session_lifetime'] = 30;
\$config['ip_check'] = true;
\$config['referer_check'] = true;
\$config['x_frame_options'] = 'sameorigin';

// Display
\$config['htmleditor'] = 1;
\$config['draft_autosave'] = 60;

// Address book
\$config['address_book_type'] = 'sql';
?>
EOF

chown www-data:www-data /var/www/$WEBMAIL_SUBDOMAIN/config/config.inc.php
chmod 640 /var/www/$WEBMAIL_SUBDOMAIN/config/config.inc.php

print_success "RoundCube configured"

# Create Apache virtual hosts
print_section "Configuring Apache Virtual Hosts"

# PostfixAdmin virtual host
cat > /etc/apache2/sites-available/$POSTFIXADMIN_SUBDOMAIN.conf <<EOF
<VirtualHost *:80>
    ServerName $POSTFIXADMIN_SUBDOMAIN
    Redirect permanent / https://$POSTFIXADMIN_SUBDOMAIN/
</VirtualHost>

<VirtualHost *:443>
    ServerName $POSTFIXADMIN_SUBDOMAIN
    DocumentRoot /var/www/$POSTFIXADMIN_SUBDOMAIN/public
    
    SSLEngine on
    SSLCertificateFile $SSL_CERT_PATH
    SSLCertificateKeyFile $SSL_KEY_PATH
    
    <Directory /var/www/$POSTFIXADMIN_SUBDOMAIN/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/$POSTFIXADMIN_SUBDOMAIN-error.log
    CustomLog \${APACHE_LOG_DIR}/$POSTFIXADMIN_SUBDOMAIN-access.log combined
</VirtualHost>
EOF

# RoundCube virtual host
cat > /etc/apache2/sites-available/$WEBMAIL_SUBDOMAIN.conf <<EOF
<VirtualHost *:80>
    ServerName $WEBMAIL_SUBDOMAIN
    Redirect permanent / https://$WEBMAIL_SUBDOMAIN/
</VirtualHost>

<VirtualHost *:443>
    ServerName $WEBMAIL_SUBDOMAIN
    DocumentRoot /var/www/$WEBMAIL_SUBDOMAIN
    
    SSLEngine on
    SSLCertificateFile $SSL_CERT_PATH
    SSLCertificateKeyFile $SSL_KEY_PATH
    
    <Directory /var/www/$WEBMAIL_SUBDOMAIN>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/$WEBMAIL_SUBDOMAIN-error.log
    CustomLog \${APACHE_LOG_DIR}/$WEBMAIL_SUBDOMAIN-access.log combined
</VirtualHost>
EOF

# Enable sites
a2ensite $POSTFIXADMIN_SUBDOMAIN.conf
a2ensite $WEBMAIL_SUBDOMAIN.conf
systemctl reload apache2

print_success "Apache virtual hosts configured"

# Restart services
print_section "Starting Email Services"

systemctl restart opendkim
systemctl enable opendkim
print_success "OpenDKIM started"

systemctl restart postfix
systemctl enable postfix
print_success "Postfix started"

systemctl restart dovecot
systemctl enable dovecot
print_success "Dovecot started"

systemctl restart apache2
print_success "Apache2 restarted"

# Save credentials
print_section "Saving Configuration"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
CREDENTIALS_FILE="$PROJECT_ROOT/email-server-credentials.txt"

cat > "$CREDENTIALS_FILE" <<EOF
╔════════════════════════════════════════════════════════════╗
║           YektaYar Email Server Credentials                ║
╚════════════════════════════════════════════════════════════╝

Domain: $DOMAIN
Hostname: $HOSTNAME

DATABASE CREDENTIALS:
--------------------
Database Name: $DB_NAME
Database User: $DB_USER
Database Password: $DB_PASSWORD
Connection: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

DEFAULT EMAIL ACCOUNT:
---------------------
Email: $ADMIN_EMAIL
Password: yektayar2024 (CHANGE THIS IMMEDIATELY!)

WEBMAIL ACCESS:
--------------
URL: https://$WEBMAIL_SUBDOMAIN
Login with: $ADMIN_EMAIL / yektayar2024

POSTFIXADMIN ACCESS:
-------------------
URL: https://$POSTFIXADMIN_SUBDOMAIN/setup.php
Complete setup wizard first, then login

IMAP/SMTP SETTINGS:
------------------
IMAP Server: $HOSTNAME
IMAP Port: 993 (SSL/TLS)

SMTP Server: $HOSTNAME
SMTP Port: 587 (STARTTLS) or 465 (SSL/TLS)
SMTP Auth: Required

DKIM PUBLIC KEY:
---------------
Selector: mail
Domain: $DOMAIN

$(cat /etc/opendkim/keys/$DOMAIN/mail.txt)

IMPORTANT NOTES:
---------------
1. Add DNS records (see setup-email-dns-records.sh)
2. Change default password for $ADMIN_EMAIL
3. Complete PostfixAdmin setup at https://$POSTFIXADMIN_SUBDOMAIN/setup.php
4. Test email sending/receiving
5. Configure SPF, DKIM, and DMARC records

Generated: $(date)
EOF

chmod 600 "$CREDENTIALS_FILE"

print_success "Credentials saved to: $CREDENTIALS_FILE"

# Create DNS setup script
cat > "$SCRIPT_DIR/setup-email-dns-records.sh" <<'EODNS'
#!/bin/bash

# YektaYar Email Server DNS Configuration Guide
# This script helps you set up DNS records for email services

DOMAIN="yektayar.ir"
HOSTNAME="mail.yektayar.ir"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       YektaYar Email Server DNS Configuration              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Server IP: $SERVER_IP"
echo "Domain: $DOMAIN"
echo "Mail Hostname: $HOSTNAME"
echo ""
echo "Add the following DNS records to your domain:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. MX RECORD (Mail Exchange)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Type: MX"
echo "Name: @"
echo "Value: $HOSTNAME"
echo "Priority: 10"
echo "TTL: 3600"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. A RECORD (Mail Server)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Type: A"
echo "Name: mail"
echo "Value: $SERVER_IP"
echo "TTL: 3600"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. A RECORDS (Webmail and PostfixAdmin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Type: A"
echo "Name: webmail"
echo "Value: $SERVER_IP"
echo "TTL: 3600"
echo ""
echo "Type: A"
echo "Name: postfixadmin"
echo "Value: $SERVER_IP"
echo "TTL: 3600"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. SPF RECORD (Sender Policy Framework)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Type: TXT"
echo "Name: @"
echo "Value: v=spf1 mx a:$HOSTNAME ip4:$SERVER_IP -all"
echo "TTL: 3600"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. DKIM RECORD (DomainKeys Identified Mail)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Type: TXT"
echo "Name: mail._domainkey"

if [ -f /etc/opendkim/keys/$DOMAIN/mail.txt ]; then
    DKIM_VALUE=$(grep -v "^mail._domainkey" /etc/opendkim/keys/$DOMAIN/mail.txt | tr -d '\n' | sed 's/[[:space:]]//g' | sed 's/"//g' | sed 's/v=DKIM1;k=rsa;p=/v=DKIM1; k=rsa; p=/')
    echo "Value: $DKIM_VALUE"
else
    echo "Value: [Run this script on the server to see the DKIM public key]"
fi
echo "TTL: 3600"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. DMARC RECORD (Domain-based Message Authentication)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Type: TXT"
echo "Name: _dmarc"
echo "Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@$DOMAIN; ruf=mailto:dmarc@$DOMAIN; fo=1"
echo "TTL: 3600"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After adding these records, wait 15-30 minutes for DNS propagation."
echo "Then run: ./scripts/verify-email-setup.sh"
echo ""
EODNS

chmod +x "$SCRIPT_DIR/setup-email-dns-records.sh"

print_success "DNS setup script created"

# Display summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Setup Complete!                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Email server has been successfully installed and configured!${NC}\n"

echo "Services Installed:"
echo "  ✓ Postfix (SMTP Server)"
echo "  ✓ Dovecot (IMAP/POP3 Server)"
echo "  ✓ OpenDKIM (DKIM Signing)"
echo "  ✓ PostfixAdmin (Web Management)"
echo "  ✓ RoundCube (Webmail)"
echo ""

echo "Access Points:"
echo "  • Webmail: https://$WEBMAIL_SUBDOMAIN"
echo "  • PostfixAdmin: https://$POSTFIXADMIN_SUBDOMAIN"
echo ""

echo "Default Mailbox:"
echo "  • Email: $ADMIN_EMAIL"
echo "  • Password: yektayar2024 (CHANGE THIS!)"
echo ""

echo "Important Files:"
echo "  • Credentials: $CREDENTIALS_FILE"
echo "  • DNS Setup: $SCRIPT_DIR/setup-email-dns-records.sh"
echo ""

echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "  1. Review credentials: cat $CREDENTIALS_FILE"
echo "  2. Setup DNS records: $SCRIPT_DIR/setup-email-dns-records.sh"
echo "  3. Complete PostfixAdmin setup: https://$POSTFIXADMIN_SUBDOMAIN/setup.php"
echo "  4. Change default password at: https://$WEBMAIL_SUBDOMAIN"
echo "  5. Test email: $SCRIPT_DIR/verify-email-setup.sh"
echo ""

echo "Useful Commands:"
echo "  • Check Postfix: systemctl status postfix"
echo "  • Check Dovecot: systemctl status dovecot"
echo "  • Check OpenDKIM: systemctl status opendkim"
echo "  • View mail logs: tail -f /var/log/mail.log"
echo "  • Test DKIM: opendkim-testkey -d $DOMAIN -s mail -vvv"
echo ""
