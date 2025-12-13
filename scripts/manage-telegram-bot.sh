#!/bin/bash

# ==============================================================================
# YektaYar - Telegram Bot Management Script
# ==============================================================================
# This script helps manage the Telegram bot configuration and setup
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if .env file exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_msg "$RED" "❌ .env file not found at $ENV_FILE"
        print_msg "$YELLOW" "Run: cp .env.example .env"
        exit 1
    fi
}

# Get current bot token from .env
get_bot_token() {
    if [ -f "$ENV_FILE" ]; then
        grep "^TELEGRAM_BOT_TOKEN=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'"
    fi
}

# Get current admin chat ID from .env
get_admin_chat_id() {
    if [ -f "$ENV_FILE" ]; then
        grep "^TELEGRAM_ADMIN_CHAT_ID=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'"
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

# Show current configuration
show_config() {
    print_msg "$BLUE" "\n📋 Current Telegram Bot Configuration"
    print_msg "$BLUE" "======================================"
    
    local bot_token=$(get_bot_token)
    local admin_chat_id=$(get_admin_chat_id)
    
    if [ -z "$bot_token" ] || [ "$bot_token" = "your_telegram_bot_token_here" ]; then
        print_msg "$RED" "Bot Token: Not configured"
    else
        print_msg "$GREEN" "Bot Token: ${bot_token:0:10}...${bot_token: -10}"
    fi
    
    if [ -z "$admin_chat_id" ] || [ "$admin_chat_id" = "your_admin_chat_id_here" ]; then
        print_msg "$RED" "Admin Chat ID: Not configured"
    else
        print_msg "$GREEN" "Admin Chat ID: $admin_chat_id"
    fi
    
    echo ""
}

# Setup bot token
setup_token() {
    print_msg "$BLUE" "\n🤖 Telegram Bot Token Setup"
    print_msg "$BLUE" "============================"
    print_msg "$YELLOW" "\nTo get a bot token:"
    print_msg "$YELLOW" "1. Open Telegram and search for @BotFather"
    print_msg "$YELLOW" "2. Send /newbot command"
    print_msg "$YELLOW" "3. Follow the instructions to create your bot"
    print_msg "$YELLOW" "4. Copy the bot token provided by BotFather"
    
    echo ""
    read -p "Enter your bot token (or press Enter to skip): " bot_token
    
    if [ -n "$bot_token" ]; then
        update_env_var "TELEGRAM_BOT_TOKEN" "$bot_token"
        print_msg "$GREEN" "✅ Bot token saved successfully!"
    else
        print_msg "$YELLOW" "⚠️  Skipped bot token setup"
    fi
}

# Setup admin chat ID
setup_admin_chat_id() {
    print_msg "$BLUE" "\n👤 Admin Chat ID Setup"
    print_msg "$BLUE" "======================"
    print_msg "$YELLOW" "\nTo get your chat ID:"
    print_msg "$YELLOW" "1. Open Telegram and search for @userinfobot"
    print_msg "$YELLOW" "2. Start a chat with the bot"
    print_msg "$YELLOW" "3. The bot will send you your chat ID"
    print_msg "$YELLOW" "4. Copy that chat ID"
    
    echo ""
    read -p "Enter admin chat ID (or press Enter to skip): " admin_chat_id
    
    if [ -n "$admin_chat_id" ]; then
        update_env_var "TELEGRAM_ADMIN_CHAT_ID" "$admin_chat_id"
        print_msg "$GREEN" "✅ Admin chat ID saved successfully!"
    else
        print_msg "$YELLOW" "⚠️  Skipped admin chat ID setup"
    fi
}

# Test bot connection
test_bot() {
    print_msg "$BLUE" "\n🧪 Testing Bot Connection"
    print_msg "$BLUE" "=========================="
    
    local bot_token=$(get_bot_token)
    
    if [ -z "$bot_token" ] || [ "$bot_token" = "your_telegram_bot_token_here" ]; then
        print_msg "$RED" "❌ Bot token not configured"
        return 1
    fi
    
    print_msg "$YELLOW" "Checking bot connection..."
    
    # Use curl to call getMe API
    local response=$(curl -s "https://api.telegram.org/bot${bot_token}/getMe")
    
    if echo "$response" | grep -q '"ok":true'; then
        local bot_username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d '"' -f4)
        local bot_name=$(echo "$response" | grep -o '"first_name":"[^"]*"' | cut -d '"' -f4)
        
        print_msg "$GREEN" "✅ Bot connection successful!"
        print_msg "$GREEN" "Bot Name: $bot_name"
        print_msg "$GREEN" "Bot Username: @$bot_username"
    else
        print_msg "$RED" "❌ Bot connection failed"
        print_msg "$RED" "Response: $response"
        return 1
    fi
}

# Send test message
send_test_message() {
    print_msg "$BLUE" "\n📨 Send Test Message"
    print_msg "$BLUE" "===================="
    
    local bot_token=$(get_bot_token)
    local admin_chat_id=$(get_admin_chat_id)
    
    if [ -z "$bot_token" ] || [ "$bot_token" = "your_telegram_bot_token_here" ]; then
        print_msg "$RED" "❌ Bot token not configured"
        return 1
    fi
    
    if [ -z "$admin_chat_id" ] || [ "$admin_chat_id" = "your_admin_chat_id_here" ]; then
        print_msg "$RED" "❌ Admin chat ID not configured"
        return 1
    fi
    
    local message="🧪 Test message from YektaYar\n\nThis is a test notification to verify the Telegram bot integration is working correctly.\n\n⏰ Time: $(date '+%Y-%m-%d %H:%M:%S')"
    
    print_msg "$YELLOW" "Sending test message..."
    
    local response=$(curl -s -X POST "https://api.telegram.org/bot${bot_token}/sendMessage" \
        -H "Content-Type: application/json" \
        -d "{\"chat_id\": \"${admin_chat_id}\", \"text\": \"${message}\"}")
    
    if echo "$response" | grep -q '"ok":true'; then
        print_msg "$GREEN" "✅ Test message sent successfully!"
        print_msg "$GREEN" "Check your Telegram for the message"
    else
        print_msg "$RED" "❌ Failed to send test message"
        print_msg "$RED" "Response: $response"
        return 1
    fi
}

# Interactive setup
interactive_setup() {
    print_msg "$GREEN" "\n🤖 YektaYar Telegram Bot Setup"
    print_msg "$GREEN" "==============================="
    
    check_env_file
    show_config
    
    setup_token
    setup_admin_chat_id
    
    echo ""
    print_msg "$GREEN" "✅ Configuration saved!"
    print_msg "$YELLOW" "\nNext steps:"
    print_msg "$YELLOW" "1. Test your bot connection: $0 test"
    print_msg "$YELLOW" "2. Send a test message: $0 test-message"
    print_msg "$YELLOW" "3. Start your backend server: npm run dev:backend"
}

# Show help
show_help() {
    cat << EOF
🤖 YektaYar Telegram Bot Management Script

Usage: $0 [command]

Commands:
  setup            Interactive setup for bot token and admin chat ID
  config           Show current configuration
  test             Test bot connection
  test-message     Send a test message to admin chat
  help             Show this help message

Examples:
  $0 setup              # Run interactive setup
  $0 config             # Show current bot configuration
  $0 test               # Test if bot token is valid
  $0 test-message       # Send a test message

For more information, see the documentation.
EOF
}

# Main script logic
main() {
    local command=${1:-help}
    
    case $command in
        setup)
            interactive_setup
            ;;
        config)
            check_env_file
            show_config
            ;;
        test)
            check_env_file
            test_bot
            ;;
        test-message)
            check_env_file
            send_test_message
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_msg "$RED" "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
