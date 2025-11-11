#!/bin/bash

# YektaYar Email Service Test Script
# This script tests the email service integration in the backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      YektaYar Email Service Test Script                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Check if we're in the right directory
if [ ! -f "packages/backend/package.json" ]; then
    echo -e "${RED}Error: Must be run from project root directory${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f "packages/backend/.env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp packages/backend/.env.example packages/backend/.env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}Please update email configuration in packages/backend/.env${NC}"
    echo ""
fi

# Check if nodemailer is installed
echo -e "${BLUE}Checking dependencies...${NC}"
if [ ! -d "packages/backend/node_modules/nodemailer" ]; then
    echo -e "${YELLOW}nodemailer not found. Installing...${NC}"
    cd packages/backend
    npm install nodemailer @types/nodemailer
    cd ../..
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ nodemailer is installed${NC}"
fi

# Create a test script
echo -e "\n${BLUE}Creating email test file...${NC}"

cat > packages/backend/test-email.ts <<'EOF'
import { 
  testEmailConnection,
  sendRegistrationEmail,
  sendPasswordResetEmail,
  sendAppointmentConfirmationEmail
} from './src/services/emailService'

async function testEmail() {
  console.log('🧪 Testing Email Service...\n')
  
  // Test 1: Connection test
  console.log('1️⃣  Testing SMTP connection...')
  const connectionTest = await testEmailConnection()
  if (connectionTest.success) {
    console.log('   ✅ SMTP connection successful\n')
  } else {
    console.log('   ❌ SMTP connection failed:', connectionTest.error)
    console.log('   ⚠️  Please check your email configuration in .env\n')
    return
  }
  
  // Get test email from command line argument or use default
  const testEmail = process.argv[2] || 'test@example.com'
  
  // Test 2: Registration email
  console.log(`2️⃣  Sending registration email to ${testEmail}...`)
  const registrationTest = await sendRegistrationEmail(
    testEmail,
    'کاربر تست',
    '123456'
  )
  if (registrationTest.success) {
    console.log('   ✅ Registration email sent successfully\n')
  } else {
    console.log('   ❌ Failed to send registration email:', registrationTest.error, '\n')
  }
  
  // Test 3: Password reset email
  console.log(`3️⃣  Sending password reset email to ${testEmail}...`)
  const resetTest = await sendPasswordResetEmail(
    testEmail,
    'کاربر تست',
    'RESET123'
  )
  if (resetTest.success) {
    console.log('   ✅ Password reset email sent successfully\n')
  } else {
    console.log('   ❌ Failed to send password reset email:', resetTest.error, '\n')
  }
  
  // Test 4: Appointment confirmation email
  console.log(`4️⃣  Sending appointment confirmation email to ${testEmail}...`)
  const appointmentTest = await sendAppointmentConfirmationEmail(
    testEmail,
    'کاربر تست',
    {
      date: '1403/08/20',
      time: '14:00',
      psychologistName: 'دکتر احمدی',
      type: 'آنلاین'
    }
  )
  if (appointmentTest.success) {
    console.log('   ✅ Appointment confirmation email sent successfully\n')
  } else {
    console.log('   ❌ Failed to send appointment email:', appointmentTest.error, '\n')
  }
  
  console.log('✨ Email service test completed!')
  console.log('\n📧 Check the inbox of:', testEmail)
}

testEmail().catch(console.error)
EOF

echo -e "${GREEN}✓ Test file created${NC}"

# Display instructions
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  How to Test                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo "1. Configure email settings in packages/backend/.env:"
echo ""
echo "   SMTP_HOST=mail.yektayar.ir"
echo "   SMTP_PORT=587"
echo "   SMTP_SECURE=false"
echo "   SMTP_USER=info@yektayar.ir"
echo "   SMTP_PASSWORD=your_password"
echo "   EMAIL_FROM=YektaYar <info@yektayar.ir>"
echo ""
echo "2. Run the test script:"
echo ""
echo "   cd packages/backend"
echo "   bun test-email.ts your-email@example.com"
echo ""
echo "   (Replace your-email@example.com with your actual email)"
echo ""
echo "3. Check your inbox for 3 test emails:"
echo "   - Registration verification email"
echo "   - Password reset email"
echo "   - Appointment confirmation email"
echo ""
echo -e "${YELLOW}Note: Make sure email server is configured first:${NC}"
echo "   sudo ./scripts/setup-email-server.sh"
echo "   ./scripts/setup-email-dns-records.sh"
echo "   sudo ./scripts/verify-email-setup.sh"
echo ""
