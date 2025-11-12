# GitHub + Discord Integration Guide

This guide explains how to integrate the YektaYar GitHub repository with Discord for team collaboration and real-time notifications.

## Why Discord?

Discord is recommended for the following reasons:

- ✅ **Free for unlimited users** - Perfect for open source projects
- ✅ **Excellent GitHub integration** - Native webhooks support
- ✅ **Rich notifications** - Embeds, mentions, reactions
- ✅ **Organized channels** - Separate channels for different purposes
- ✅ **Voice/video calls** - Free for all team members
- ✅ **Screen sharing** - Great for code reviews and debugging
- ✅ **Bots and automation** - Extensive ecosystem
- ✅ **Mobile apps** - iOS, Android, Desktop, Web
- ✅ **Developer-friendly** - Great API and webhook support

## Alternative Platforms Considered

| Platform | Free Plan | GitHub Integration | Notes |
|----------|-----------|-------------------|-------|
| **Discord** ✅ | Unlimited | Excellent | **Recommended** |
| Slack | Limited (90 days history) | Good | Expensive for teams |
| Microsoft Teams | Limited | Good | Complex setup |
| Mattermost | Self-hosted required | Good | Requires hosting |
| Rocket.Chat | Self-hosted required | Good | Requires hosting |

## Discord Setup

### 1. Create Discord Server

1. Open Discord and click the `+` button on the left sidebar
2. Select "Create My Own"
3. Choose "For a club or community"
4. Name your server: **YektaYar Development**
5. Upload the YektaYar logo as server icon

### 2. Create Channels

Organize your server with these recommended channels:

```
📢 GENERAL
├─ #welcome
├─ #announcements
└─ #general-chat

💻 DEVELOPMENT
├─ #github-feed         (GitHub webhook notifications)
├─ #code-review         (PR reviews and discussions)
├─ #backend-dev         (Backend discussions)
├─ #frontend-dev        (Frontend discussions)
├─ #mobile-dev          (Mobile app discussions)
└─ #devops              (CI/CD, deployment)

🐛 ISSUES & SUPPORT
├─ #bugs                (Bug reports)
├─ #features            (Feature requests)
└─ #help                (Q&A and support)

📚 DOCUMENTATION
├─ #docs                (Documentation discussions)
└─ #resources           (Learning resources, links)

🤖 AUTOMATION
└─ #bot-commands        (Bot interactions)
```

### 3. Set Up Roles

Create these roles with appropriate permissions:

- **Maintainer** - Full permissions
- **Core Contributor** - Can manage messages, kick/ban
- **Contributor** - Standard member
- **Bot** - For automation bots

## GitHub Webhook Integration

### Method 1: Discord's Built-in GitHub Webhook

This is the simplest method and works great for basic notifications.

#### Step 1: Get Discord Webhook URL

1. Go to your Discord server
2. Right-click on `#github-feed` channel → Edit Channel
3. Go to "Integrations" → "Webhooks"
4. Click "New Webhook"
5. Name it: **GitHub Bot**
6. Copy the Webhook URL (keep it secret!)

#### Step 2: Add Webhook to GitHub

1. Go to https://github.com/atomicdeploy/yektayar/settings/hooks
2. Click "Add webhook"
3. **Payload URL**: Paste your Discord webhook URL and add `/github` at the end
   - Example: `https://discord.com/api/webhooks/123456789/abcdefgh/github`
4. **Content type**: `application/json`
5. **Which events?**: Select:
   - ✅ Issues
   - ✅ Issue comments
   - ✅ Pull requests
   - ✅ Pull request reviews
   - ✅ Pull request review comments
   - ✅ Pushes
   - ✅ Releases
   - ✅ Stars
   - ✅ Workflow runs
6. ✅ Active
7. Click "Add webhook"

#### Step 3: Test the Webhook

1. Create a test issue or comment
2. Check your `#github-feed` channel
3. You should see a notification!

### Method 2: Advanced Integration with Discord Bot

For more advanced features, you can create a custom Discord bot.

#### Features:
- Custom notification formatting
- Slash commands (e.g., `/issue create`, `/pr list`)
- Interactive buttons and menus
- Advanced filtering
- Custom triggers

#### Setup:

1. **Create Discord Bot**:
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name it: **YektaYar Bot**
   - Go to "Bot" section → "Add Bot"
   - Copy the Bot Token

2. **Invite Bot to Server**:
   - Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: 
     - Send Messages
     - Embed Links
     - Add Reactions
     - Use Slash Commands
   - Copy the generated URL and open it
   - Select your server and authorize

3. **Bot Code** (Optional - for future enhancement):
   ```javascript
   // See scripts/discord-bot.js (if you decide to implement)
   ```

## Webhook Configuration File

Save webhook configuration for your repository:

```json
{
  "discord": {
    "webhookUrl": "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN/github",
    "events": [
      "issues",
      "issue_comment",
      "pull_request",
      "pull_request_review",
      "pull_request_review_comment",
      "push",
      "release",
      "star",
      "workflow_run"
    ]
  }
}
```

**⚠️ IMPORTANT**: Never commit webhook URLs or tokens to version control!

## Notification Examples

### Issue Created
```
🐛 New issue #123 by @username
Title: Bug in login form
Labels: bug, frontend
https://github.com/atomicdeploy/yektayar/issues/123
```

### Pull Request Opened
```
📥 New pull request #45 by @username
Title: Fix login validation
Changes: +50 -20
https://github.com/atomicdeploy/yektayar/pull/45
```

### CI/CD Status
```
✅ Workflow "CI" succeeded on main
📦 Build and tests passed
https://github.com/atomicdeploy/yektayar/actions/runs/123456
```

## Best Practices

### Channel Organization

- **#github-feed**: All automated GitHub notifications
- **#code-review**: Manual PR discussions (not automated)
- **#bugs**: Bug discussions (separate from automated notifications)

### Notification Management

To avoid notification overload:

1. **Filter by channel**: Different webhooks for different channels
2. **Mute channels**: Users can mute `#github-feed` if too noisy
3. **Custom filters**: Use Discord bot for advanced filtering
4. **Quiet hours**: Configure bot to be silent during off-hours

### Discord Etiquette

- Use threads for longer discussions
- React with ✅ when you've seen important messages
- Use @mentions sparingly
- Keep channels on-topic
- Pin important messages

## Troubleshooting

### Webhook not working?

1. **Check URL**: Make sure it ends with `/github`
2. **Check permissions**: Webhook needs write access to channel
3. **Check events**: Verify events are selected in GitHub
4. **Test webhook**: Use "Redeliver" button in GitHub webhook settings
5. **Check logs**: GitHub webhook page shows delivery logs

### Too many notifications?

1. Create separate webhooks for different channels
2. Filter events (select only what you need)
3. Use custom Discord bot for filtering
4. Mute `#github-feed` channel for yourself

### Message format issues?

- Discord's GitHub webhook expects `/github` suffix
- Content-Type must be `application/json`
- GitHub must send data in expected format

## Security Considerations

1. **Keep webhook URLs secret**: Anyone with URL can post to your channel
2. **Regenerate if leaked**: You can regenerate webhook URL in Discord
3. **Use HTTPS only**: Never use HTTP webhooks
4. **Validate payloads**: If building custom bot, validate GitHub signatures
5. **Limit permissions**: Give webhook/bot only necessary permissions

## Additional Resources

- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)
- [GitHub Webhooks Documentation](https://docs.github.com/en/webhooks)
- [Discord.js Guide](https://discordjs.guide/) (for custom bots)
- [Discord Developer Portal](https://discord.com/developers/applications)

## Future Enhancements

Consider these for future implementation:

1. **Custom Discord Bot** with:
   - Slash commands for GitHub operations
   - Issue/PR creation from Discord
   - Advanced notification filters
   - Analytics and statistics

2. **Integration with CI/CD**:
   - Deployment notifications
   - Test results summaries
   - Performance metrics

3. **Code Review Assistance**:
   - Automatic PR reminders
   - Review request notifications
   - Merge conflict alerts

4. **Team Metrics**:
   - Contribution statistics
   - Response time tracking
   - Activity summaries

## Getting Help

If you need help setting up Discord integration:

1. Check this documentation
2. Ask in `#help` channel (once set up)
3. Open an issue with the `❓ question` label
4. Consult Discord's documentation

---

**Happy collaborating! 🚀**
