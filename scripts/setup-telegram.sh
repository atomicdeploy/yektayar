#!/bin/bash

# ==============================================================================
# YektaYar - Complete Telegram Setup Script
# ==============================================================================
# This script sets up both the Telegram bot and Telegram mini app integration
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/.env"

# Print colored message
print_msg() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Print section header
print_section() {
    echo ""
    print_msg "$CYAN" "═══════════════════════════════════════════════════════════════"
    print_msg "$CYAN" "  $1"
    print_msg "$CYAN" "═══════════════════════════════════════════════════════════════"
    echo ""
}

# Check if .env file exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_msg "$RED" "❌ .env file not found at $ENV_FILE"
        print_msg "$YELLOW" "Creating .env from .env.example..."
        cp "$ROOT_DIR/.env.example" "$ENV_FILE"
        print_msg "$GREEN" "✅ .env file created"
    fi
}

# Update environment variable in .env file
update_env_var() {
    local var_name=$1
    local var_value=$2
    
    if grep -q "^${var_name}=" "$ENV_FILE"; then
        # Variable exists, update it
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^${var_name}=.*|${var_name}=${var_value}|" "$ENV_FILE"
        else
            # Linux
            sed -i "s|^${var_name}=.*|${var_name}=${var_value}|" "$ENV_FILE"
        fi
    else
        # Variable doesn't exist, add it
        echo "${var_name}=${var_value}" >> "$ENV_FILE"
    fi
}

# Get environment variable from .env
get_env_var() {
    local var_name=$1
    if [ -f "$ENV_FILE" ]; then
        grep "^${var_name}=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'"
    fi
}

# Show welcome screen
show_welcome() {
    clear
    print_msg "$MAGENTA" "╔═══════════════════════════════════════════════════════════════╗"
    print_msg "$MAGENTA" "║                                                               ║"
    print_msg "$MAGENTA" "║         🤖 YektaYar Telegram Complete Setup 🤖               ║"
    print_msg "$MAGENTA" "║                                                               ║"
    print_msg "$MAGENTA" "║       Setup both Telegram Bot & Mini App Integration         ║"
    print_msg "$MAGENTA" "║                                                               ║"
    print_msg "$MAGENTA" "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    print_msg "$CYAN" "This script will guide you through:"
    print_msg "$YELLOW" "  1️⃣  Creating/configuring your Telegram bot"
    print_msg "$YELLOW" "  2️⃣  Setting up bot token and admin chat"
    print_msg "$YELLOW" "  3️⃣  Configuring Telegram mini app integration"
    print_msg "$YELLOW" "  4️⃣  Testing bot functionality"
    echo ""
}

# Bot creation guide
guide_bot_creation() {
    print_section "Step 1: Create Telegram Bot"
    
    print_msg "$BLUE" "📱 If you don't have a bot yet, follow these steps:"
    echo ""
    print_msg "$YELLOW" "1. Open Telegram and search for: @BotFather"
    print_msg "$YELLOW" "2. Start a chat and send: /newbot"
    print_msg "$YELLOW" "3. Choose a display name (e.g., 'YektaYar Bot')"
    print_msg "$YELLOW" "4. Choose a username (must end with 'bot', e.g., 'yektayar_bot')"
    print_msg "$YELLOW" "5. BotFather will give you a TOKEN - copy it!"
    echo ""
    print_msg "$GREEN" "Example bot token format:"
    print_msg "$CYAN" "  1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890"
    echo ""
}

# Setup bot token
setup_bot_token() {
    print_section "Step 2: Configure Bot Token"
    
    local current_token=$(get_env_var "TELEGRAM_BOT_TOKEN")
    
    if [ -n "$current_token" ] && [ "$current_token" != "your_telegram_bot_token_here" ]; then
        print_msg "$GREEN" "✅ Current token: ${current_token:0:10}...${current_token: -10}"
        echo ""
        read -p "Do you want to update it? (y/N): " update_token
        if [[ ! "$update_token" =~ ^[Yy]$ ]]; then
            print_msg "$BLUE" "Keeping existing token"
            return 0
        fi
    fi
    
    echo ""
    read -p "Enter your bot token: " bot_token
    
    if [ -z "$bot_token" ]; then
        print_msg "$RED" "❌ Token cannot be empty"
        return 1
    fi
    
    # Validate token format
    if [[ ! "$bot_token" =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
        print_msg "$RED" "❌ Invalid token format"
        print_msg "$YELLOW" "Token should be like: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
        return 1
    fi
    
    update_env_var "TELEGRAM_BOT_TOKEN" "$bot_token"
    print_msg "$GREEN" "✅ Bot token saved!"
    
    # Test the token
    print_msg "$BLUE" "Testing bot token..."
    local response=$(curl -s "https://api.telegram.org/bot${bot_token}/getMe")
    
    if echo "$response" | grep -q '"ok":true'; then
        local bot_username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d '"' -f4)
        local bot_name=$(echo "$response" | grep -o '"first_name":"[^"]*"' | cut -d '"' -f4)
        print_msg "$GREEN" "✅ Bot connection successful!"
        print_msg "$CYAN" "   Bot Name: $bot_name"
        print_msg "$CYAN" "   Username: @$bot_username"
    else
        print_msg "$RED" "❌ Failed to connect to bot"
        print_msg "$YELLOW" "Please check your token and try again"
        return 1
    fi
}

# Setup admin chat ID
setup_admin_chat() {
    print_section "Step 3: Configure Admin Chat ID"
    
    print_msg "$BLUE" "📱 To get your chat ID:"
    echo ""
    print_msg "$YELLOW" "1. Open Telegram and search for: @userinfobot"
    print_msg "$YELLOW" "2. Start a chat with the bot"
    print_msg "$YELLOW" "3. The bot will send you your chat ID"
    print_msg "$YELLOW" "4. Copy that number (including the minus sign if present)"
    echo ""
    print_msg "$CYAN" "💡 For a group chat:"
    print_msg "$YELLOW" "   - Add @userinfobot to your group"
    print_msg "$YELLOW" "   - Send any message"
    print_msg "$YELLOW" "   - The bot will reply with the group chat ID"
    echo ""
    
    local current_chat_id=$(get_env_var "TELEGRAM_ADMIN_CHAT_ID")
    
    if [ -n "$current_chat_id" ] && [ "$current_chat_id" != "your_admin_chat_id_here" ]; then
        print_msg "$GREEN" "✅ Current admin chat ID: $current_chat_id"
        echo ""
        read -p "Do you want to update it? (y/N): " update_chat
        if [[ ! "$update_chat" =~ ^[Yy]$ ]]; then
            print_msg "$BLUE" "Keeping existing chat ID"
            return 0
        fi
    fi
    
    echo ""
    read -p "Enter admin chat ID: " chat_id
    
    if [ -z "$chat_id" ]; then
        print_msg "$YELLOW" "⚠️  Skipping admin chat ID setup"
        return 0
    fi
    
    update_env_var "TELEGRAM_ADMIN_CHAT_ID" "$chat_id"
    print_msg "$GREEN" "✅ Admin chat ID saved!"
}

# Setup mini app
setup_mini_app() {
    print_section "Step 4: Configure Telegram Mini App"
    
    print_msg "$BLUE" "🚀 Setting up Telegram Mini App integration..."
    echo ""
    print_msg "$YELLOW" "The mini app allows users to access YektaYar directly inside Telegram!"
    echo ""
    print_msg "$CYAN" "📱 To configure the mini app menu button:"
    echo ""
    print_msg "$YELLOW" "1. Open Telegram and go to @BotFather"
    print_msg "$YELLOW" "2. Send: /mybots"
    print_msg "$YELLOW" "3. Select your bot"
    print_msg "$YELLOW" "4. Choose: Bot Settings → Menu Button"
    print_msg "$YELLOW" "5. Select: Configure Menu Button"
    print_msg "$YELLOW" "6. Enter this URL:"
    echo ""
    
    # Determine the app URL based on environment
    local app_url="https://app.yektayar.ir"
    local current_env=$(get_env_var "VITE_ENVIRONMENT")
    
    if [ "$current_env" = "development" ]; then
        app_url="http://localhost:8100"
        print_msg "$CYAN" "   Development: $app_url"
        print_msg "$YELLOW" "   (Use ngrok or similar for external access in dev)"
    else
        print_msg "$CYAN" "   Production: $app_url"
    fi
    
    echo ""
    print_msg "$GREEN" "✅ Mini app configuration ready!"
    print_msg "$BLUE" "After configuring in BotFather, users can click the menu button"
    print_msg "$BLUE" "in your bot to open YektaYar directly in Telegram!"
}

# Test bot
test_bot() {
    print_section "Step 5: Test Bot Functionality"
    
    local bot_token=$(get_env_var "TELEGRAM_BOT_TOKEN")
    local admin_chat_id=$(get_env_var "TELEGRAM_ADMIN_CHAT_ID")
    
    if [ -z "$bot_token" ] || [ "$bot_token" = "your_telegram_bot_token_here" ]; then
        print_msg "$RED" "❌ Bot token not configured. Skipping tests."
        return 1
    fi
    
    print_msg "$BLUE" "Testing bot connection..."
    local response=$(curl -s "https://api.telegram.org/bot${bot_token}/getMe")
    
    if echo "$response" | grep -q '"ok":true'; then
        print_msg "$GREEN" "✅ Bot is online and responding"
    else
        print_msg "$RED" "❌ Bot connection failed"
        return 1
    fi
    
    if [ -n "$admin_chat_id" ] && [ "$admin_chat_id" != "your_admin_chat_id_here" ]; then
        echo ""
        read -p "Send a test message to admin chat? (Y/n): " send_test
        
        if [[ ! "$send_test" =~ ^[Nn]$ ]]; then
            local message="🧪 YektaYar Setup Test

This is a test message from the Telegram bot setup script.

✅ Bot is configured and working correctly!
⏰ Time: $(date '+%Y-%m-%d %H:%M:%S')

You can now:
• Receive admin notifications
• Send messages to users
• Use the Telegram mini app

For more info, see: docs/TELEGRAM-BOT.md"
            
            local response=$(curl -s -X POST "https://api.telegram.org/bot${bot_token}/sendMessage" \
                -H "Content-Type: application/json" \
                -d "{\"chat_id\": \"${admin_chat_id}\", \"text\": \"${message}\"}")
            
            if echo "$response" | grep -q '"ok":true'; then
                print_msg "$GREEN" "✅ Test message sent successfully!"
                print_msg "$CYAN" "Check your Telegram for the message"
            else
                print_msg "$RED" "❌ Failed to send test message"
                print_msg "$YELLOW" "Please check your admin chat ID"
            fi
        fi
    fi
}

# Show summary
show_summary() {
    print_section "Setup Complete! 🎉"
    
    local bot_token=$(get_env_var "TELEGRAM_BOT_TOKEN")
    local admin_chat_id=$(get_env_var "TELEGRAM_ADMIN_CHAT_ID")
    
    print_msg "$GREEN" "✅ Telegram bot is configured!"
    echo ""
    print_msg "$CYAN" "📋 Configuration Summary:"
    echo ""
    
    if [ -n "$bot_token" ] && [ "$bot_token" != "your_telegram_bot_token_here" ]; then
        print_msg "$GREEN" "  ✓ Bot Token: Configured"
    else
        print_msg "$RED" "  ✗ Bot Token: Not configured"
    fi
    
    if [ -n "$admin_chat_id" ] && [ "$admin_chat_id" != "your_admin_chat_id_here" ]; then
        print_msg "$GREEN" "  ✓ Admin Chat ID: $admin_chat_id"
    else
        print_msg "$YELLOW" "  ⚠ Admin Chat ID: Not configured"
    fi
    
    print_msg "$GREEN" "  ✓ Mini App: Ready to configure"
    
    echo ""
    print_msg "$BLUE" "📚 Next Steps:"
    echo ""
    print_msg "$YELLOW" "1. Configure bot commands:"
    print_msg "$CYAN" "   npm run telegram:test-bot"
    echo ""
    print_msg "$YELLOW" "2. Send test messages:"
    print_msg "$CYAN" "   npm run telegram:send-messages"
    echo ""
    print_msg "$YELLOW" "3. Start the backend to enable bot:"
    print_msg "$CYAN" "   npm run dev:backend"
    echo ""
    print_msg "$YELLOW" "4. Read the documentation:"
    print_msg "$CYAN" "   docs/TELEGRAM-BOT.md"
    print_msg "$CYAN" "   packages/mobile-app/docs/TELEGRAM_MINI_APP.md"
    echo ""
    print_msg "$GREEN" "🎉 You're all set! Enjoy using Telegram with YektaYar!"
    echo ""
}

# Main setup flow
main() {
    show_welcome
    
    read -p "Press Enter to start setup..."
    
    check_env_file
    guide_bot_creation
    
    read -p "Press Enter to continue..."
    
    if ! setup_bot_token; then
        print_msg "$RED" "Setup failed. Please fix the issues and try again."
        exit 1
    fi
    
    echo ""
    read -p "Press Enter to continue..."
    
    setup_admin_chat
    
    echo ""
    read -p "Press Enter to continue..."
    
    setup_mini_app
    
    echo ""
    read -p "Press Enter to run tests..."
    
    test_bot
    
    show_summary
}

# Run main function
main
