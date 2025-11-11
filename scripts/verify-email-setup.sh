#!/bin/bash

# YektaYar Email Server Verification Script
# This script verifies DNS records and email server configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

DOMAIN="yektayar.ir"
HOSTNAME="mail.yektayar.ir"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      YektaYar Email Server Verification Script            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}▶ $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
}

# Function to print check results
print_check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Function to print info
print_info() {
    echo -e "${YELLOW}➜${NC} $1"
}

# Check if required tools are installed
print_section "Checking Required Tools"

MISSING_TOOLS=""

if ! command -v dig &> /dev/null; then
    print_check 1 "dig (dnsutils) - NOT FOUND"
    MISSING_TOOLS="$MISSING_TOOLS dnsutils"
else
    print_check 0 "dig (dnsutils) - OK"
fi

if ! command -v nc &> /dev/null; then
    print_check 1 "nc (netcat) - NOT FOUND"
    MISSING_TOOLS="$MISSING_TOOLS netcat"
else
    print_check 0 "nc (netcat) - OK"
fi

if [ -n "$MISSING_TOOLS" ]; then
    echo ""
    echo -e "${YELLOW}Installing missing tools...${NC}"
    apt update && apt install -y $MISSING_TOOLS
fi

# Check DNS Records
print_section "Verifying DNS Records"

# Check MX Record
print_info "Checking MX record for $DOMAIN..."
MX_RECORD=$(dig +short MX $DOMAIN | awk '{print $2}')
if [[ $MX_RECORD == *"$HOSTNAME"* ]]; then
    print_check 0 "MX record points to $HOSTNAME"
else
    print_check 1 "MX record not found or incorrect (found: $MX_RECORD)"
fi

# Check A Record for mail server
print_info "Checking A record for $HOSTNAME..."
MAIL_A_RECORD=$(dig +short A $HOSTNAME)
if [ -n "$MAIL_A_RECORD" ]; then
    print_check 0 "A record for $HOSTNAME: $MAIL_A_RECORD"
else
    print_check 1 "A record for $HOSTNAME not found"
fi

# Check SPF Record
print_info "Checking SPF record..."
SPF_RECORD=$(dig +short TXT $DOMAIN | grep "v=spf1")
if [ -n "$SPF_RECORD" ]; then
    print_check 0 "SPF record found: $SPF_RECORD"
else
    print_check 1 "SPF record not found"
fi

# Check DKIM Record
print_info "Checking DKIM record..."
DKIM_RECORD=$(dig +short TXT mail._domainkey.$DOMAIN)
if [ -n "$DKIM_RECORD" ]; then
    print_check 0 "DKIM record found"
    echo "  $DKIM_RECORD"
else
    print_check 1 "DKIM record not found at mail._domainkey.$DOMAIN"
fi

# Check DMARC Record
print_info "Checking DMARC record..."
DMARC_RECORD=$(dig +short TXT _dmarc.$DOMAIN)
if [ -n "$DMARC_RECORD" ]; then
    print_check 0 "DMARC record found: $DMARC_RECORD"
else
    print_check 1 "DMARC record not found"
fi

# Check Reverse DNS (PTR)
print_info "Checking reverse DNS (PTR)..."
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
REVERSE_IP=$(echo $SERVER_IP | awk -F. '{print $4"."$3"."$2"."$1}')
PTR_RECORD=$(dig +short -x $SERVER_IP)
if [[ $PTR_RECORD == *"$HOSTNAME"* ]] || [[ $PTR_RECORD == *"$DOMAIN"* ]]; then
    print_check 0 "Reverse DNS (PTR) configured: $PTR_RECORD"
else
    print_check 1 "Reverse DNS (PTR) not configured properly (found: $PTR_RECORD)"
    echo -e "  ${YELLOW}Note: Contact your hosting provider to set PTR record${NC}"
fi

# Check Services
print_section "Verifying Email Services"

# Check Postfix
print_info "Checking Postfix (SMTP)..."
if systemctl is-active --quiet postfix; then
    print_check 0 "Postfix is running"
else
    print_check 1 "Postfix is not running"
fi

# Check Dovecot
print_info "Checking Dovecot (IMAP/POP3)..."
if systemctl is-active --quiet dovecot; then
    print_check 0 "Dovecot is running"
else
    print_check 1 "Dovecot is not running"
fi

# Check OpenDKIM
print_info "Checking OpenDKIM..."
if systemctl is-active --quiet opendkim; then
    print_check 0 "OpenDKIM is running"
else
    print_check 1 "OpenDKIM is not running"
fi

# Test DKIM Key
if [ -f /etc/opendkim/keys/$DOMAIN/mail.private ]; then
    print_info "Testing DKIM key..."
    DKIM_TEST=$(opendkim-testkey -d $DOMAIN -s mail -vvv 2>&1)
    if echo "$DKIM_TEST" | grep -q "key OK"; then
        print_check 0 "DKIM key is valid"
    elif echo "$DKIM_TEST" | grep -q "key not secure"; then
        print_check 1 "DKIM DNS record found but not yet propagated or not matching"
        echo -e "  ${YELLOW}Wait 15-30 minutes for DNS propagation${NC}"
    else
        print_check 1 "DKIM key validation failed"
        echo "  $DKIM_TEST" | head -3
    fi
fi

# Check Ports
print_section "Verifying Email Ports"

# Function to check if port is open
check_port() {
    PORT=$1
    SERVICE=$2
    if timeout 2 bash -c "echo > /dev/tcp/localhost/$PORT" 2>/dev/null; then
        print_check 0 "Port $PORT ($SERVICE) is open"
        return 0
    else
        print_check 1 "Port $PORT ($SERVICE) is not accessible"
        return 1
    fi
}

check_port 25 "SMTP"
check_port 587 "Submission (STARTTLS)"
check_port 465 "SMTPS (SSL/TLS)"
check_port 143 "IMAP"
check_port 993 "IMAPS (SSL/TLS)"
check_port 110 "POP3"
check_port 995 "POP3S (SSL/TLS)"

# Check SSL Certificates
print_section "Verifying SSL Certificates"

SSL_CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/$DOMAIN/privkey.pem"

if [ -f "$SSL_CERT" ]; then
    print_check 0 "SSL certificate found"
    
    # Check certificate expiration
    EXPIRY_DATE=$(openssl x509 -in "$SSL_CERT" -noout -enddate | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
        print_check 0 "SSL certificate is valid (expires in $DAYS_UNTIL_EXPIRY days)"
    elif [ $DAYS_UNTIL_EXPIRY -gt 0 ]; then
        print_check 1 "SSL certificate expires soon (in $DAYS_UNTIL_EXPIRY days)"
    else
        print_check 1 "SSL certificate has expired!"
    fi
else
    print_check 1 "SSL certificate not found"
fi

if [ -f "$SSL_KEY" ]; then
    print_check 0 "SSL private key found"
else
    print_check 1 "SSL private key not found"
fi

# Check Database
print_section "Verifying Database Configuration"

DB_NAME="yektayar_mail"
DB_USER="mail_admin"

print_info "Checking mail database..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_check 0 "Database '$DB_NAME' exists"
    
    # Check tables
    TABLES=$(sudo -u postgres psql -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('domain', 'mailbox', 'alias')" 2>/dev/null | tr -d ' ')
    if [ "$TABLES" = "3" ]; then
        print_check 0 "Required database tables exist"
    else
        print_check 1 "Some required tables are missing (found $TABLES/3)"
    fi
else
    print_check 1 "Database '$DB_NAME' not found"
fi

# Check Web Access
print_section "Verifying Web Access"

WEBMAIL_URL="https://webmail.$DOMAIN"
POSTFIXADMIN_URL="https://postfixadmin.$DOMAIN"

# Check if curl is available
if command -v curl &> /dev/null; then
    print_info "Testing webmail access..."
    HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" $WEBMAIL_URL --max-time 5 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        print_check 0 "Webmail is accessible at $WEBMAIL_URL"
    else
        print_check 1 "Webmail is not accessible (HTTP $HTTP_CODE)"
    fi
    
    print_info "Testing PostfixAdmin access..."
    HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" $POSTFIXADMIN_URL --max-time 5 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        print_check 0 "PostfixAdmin is accessible at $POSTFIXADMIN_URL"
    else
        print_check 1 "PostfixAdmin is not accessible (HTTP $HTTP_CODE)"
    fi
fi

# Test Email Sending
print_section "Email Functionality Test"

print_info "To test email sending, you can:"
echo "  1. Use webmail: $WEBMAIL_URL"
echo "  2. Use command line:"
echo ""
echo "     echo 'Test email' | mail -s 'Test Subject' your-email@example.com"
echo ""
echo "  3. Check mail logs:"
echo ""
echo "     tail -f /var/log/mail.log"
echo ""

# Online Testing Tools
print_section "Additional Verification Steps"

echo "Use these online tools to verify your email server:"
echo ""
echo "  1. MX Toolbox - Check all DNS records and server health"
echo "     https://mxtoolbox.com/SuperTool.aspx?action=mx:$DOMAIN"
echo ""
echo "  2. Mail Tester - Send email and get spam score"
echo "     https://www.mail-tester.com/"
echo ""
echo "  3. DKIM Validator"
echo "     https://dkimvalidator.com/"
echo ""
echo "  4. SPF Record Checker"
echo "     https://mxtoolbox.com/spf.aspx"
echo ""
echo "  5. DMARC Checker"
echo "     https://mxtoolbox.com/dmarc.aspx"
echo ""

# Summary
print_section "Verification Summary"

echo "✓ DNS records should be configured and propagated"
echo "✓ Email services should be running"
echo "✓ Ports should be accessible"
echo "✓ SSL certificates should be valid"
echo ""
echo "If any checks failed, please:"
echo "  1. Verify DNS records are properly configured"
echo "  2. Wait for DNS propagation (15-30 minutes)"
echo "  3. Check firewall rules"
echo "  4. Review service logs"
echo ""
echo "Useful troubleshooting commands:"
echo "  • Check Postfix: journalctl -u postfix -f"
echo "  • Check Dovecot: journalctl -u dovecot -f"
echo "  • Check mail logs: tail -f /var/log/mail.log"
echo "  • Test SMTP: telnet localhost 25"
echo "  • Test IMAP: telnet localhost 143"
echo ""
