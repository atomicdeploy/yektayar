#!/bin/bash
# Verification script for acquire-session API fix
# This script verifies that the environment variable fix is working correctly

set -e

COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}Session Acquisition Fix Verification${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo ""

# Check if backend is running
echo -e "${COLOR_YELLOW}[1/6] Checking if backend is running...${COLOR_RESET}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${COLOR_GREEN}✓ Backend is running${COLOR_RESET}"
else
    echo -e "${COLOR_RED}✗ Backend is not running${COLOR_RESET}"
    echo -e "${COLOR_YELLOW}   Start backend with: cd packages/backend && bun run dev${COLOR_RESET}"
    exit 1
fi
echo ""

# Test health endpoint
echo -e "${COLOR_YELLOW}[2/6] Testing health endpoint...${COLOR_RESET}"
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${COLOR_GREEN}✓ Health endpoint working${COLOR_RESET}"
    echo "   Response: $HEALTH"
else
    echo -e "${COLOR_RED}✗ Health endpoint not responding correctly${COLOR_RESET}"
    exit 1
fi
echo ""

# Test session acquisition
echo -e "${COLOR_YELLOW}[3/6] Testing session acquisition endpoint...${COLOR_RESET}"
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/acquire-session -H "Content-Type: application/json")
TOKEN=$(echo "$SESSION_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${COLOR_GREEN}✓ Session acquisition working${COLOR_RESET}"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${COLOR_RED}✗ Session acquisition failed${COLOR_RESET}"
    echo "   Response: $SESSION_RESPONSE"
    exit 1
fi
echo ""

# Test session validation
echo -e "${COLOR_YELLOW}[4/6] Testing session validation endpoint...${COLOR_RESET}"
VALIDATION_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/session)
if echo "$VALIDATION_RESPONSE" | grep -q '"success":true'; then
    echo -e "${COLOR_GREEN}✓ Session validation working${COLOR_RESET}"
    echo "   Response: $(echo "$VALIDATION_RESPONSE" | head -c 100)..."
else
    echo -e "${COLOR_RED}✗ Session validation failed${COLOR_RESET}"
    echo "   Response: $VALIDATION_RESPONSE"
    exit 1
fi
echo ""

# Check environment variable configuration in frontend apps
echo -e "${COLOR_YELLOW}[5/6] Checking frontend environment configuration...${COLOR_RESET}"

# Check mobile-app .env.example
if grep -q "VITE_API_URL" packages/mobile-app/.env.example; then
    echo -e "${COLOR_GREEN}✓ mobile-app .env.example has VITE_API_URL${COLOR_RESET}"
else
    echo -e "${COLOR_RED}✗ mobile-app .env.example missing VITE_API_URL${COLOR_RESET}"
    exit 1
fi

# Check admin-panel .env.example
if grep -q "VITE_API_URL" packages/admin-panel/.env.example; then
    echo -e "${COLOR_GREEN}✓ admin-panel .env.example has VITE_API_URL${COLOR_RESET}"
else
    echo -e "${COLOR_RED}✗ admin-panel .env.example missing VITE_API_URL${COLOR_RESET}"
    exit 1
fi

# Check mobile-app config file
if grep -q "VITE_API_URL" packages/mobile-app/src/config/index.ts; then
    echo -e "${COLOR_GREEN}✓ mobile-app config reads VITE_API_URL${COLOR_RESET}"
else
    echo -e "${COLOR_RED}✗ mobile-app config not reading VITE_API_URL${COLOR_RESET}"
    exit 1
fi

# Check admin-panel config file
if grep -q "VITE_API_URL" packages/admin-panel/src/config/index.ts; then
    echo -e "${COLOR_GREEN}✓ admin-panel config reads VITE_API_URL${COLOR_RESET}"
else
    echo -e "${COLOR_RED}✗ admin-panel config not reading VITE_API_URL${COLOR_RESET}"
    exit 1
fi
echo ""

# Test CORS for both frontend origins
echo -e "${COLOR_YELLOW}[6/6] Testing CORS configuration...${COLOR_RESET}"

# Test admin-panel origin
ADMIN_CORS=$(curl -s -X POST http://localhost:3000/api/auth/acquire-session \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -i | grep -i "access-control")

if [ -n "$ADMIN_CORS" ]; then
    echo -e "${COLOR_GREEN}✓ CORS working for admin-panel (localhost:5173)${COLOR_RESET}"
else
    echo -e "${COLOR_YELLOW}⚠ CORS headers not found for admin-panel${COLOR_RESET}"
fi

# Test mobile-app origin
MOBILE_CORS=$(curl -s -X POST http://localhost:3000/api/auth/acquire-session \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8100" \
  -i | grep -i "access-control")

if [ -n "$MOBILE_CORS" ]; then
    echo -e "${COLOR_GREEN}✓ CORS working for mobile-app (localhost:8100)${COLOR_RESET}"
else
    echo -e "${COLOR_YELLOW}⚠ CORS headers not found for mobile-app${COLOR_RESET}"
fi
echo ""

# Summary
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}✓ All verification checks passed!${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo ""
echo -e "${COLOR_YELLOW}Next steps:${COLOR_RESET}"
echo "1. Start mobile-app: cd packages/mobile-app && npm run dev"
echo "2. Start admin-panel: cd packages/admin-panel && npm run dev"
echo "3. Check browser console for 'Session acquired successfully' message"
echo "4. Verify no 404 errors in Network tab"
echo ""
echo -e "For detailed testing guide, see: ${COLOR_BLUE}TEST-SESSION-ACQUISITION.md${COLOR_RESET}"
echo -e "For fix details, see: ${COLOR_BLUE}FIX-ACQUIRE-SESSION-404.md${COLOR_RESET}"
