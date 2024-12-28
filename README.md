# Clear Discord Bot

A simple yet powerful Discord bot designed to efficiently manage and clean up messages in your Discord server. Perfect for maintaining clean channels and managing message history.

## Features

- **Message Clearing:**
  - Clear specific number of messages
  - Bulk message deletion
  - User-specific message clearing
  - Filter by message type

- **Advanced Filtering:**
  - Clear by time range
  - Filter by user
  - Filter by message content
  - Bot message filtering

- **Permissions System:**
  - Role-based permissions
  - Command restrictions
  - User permission checks
  - Channel-specific permissions

- **Logging:**
  - Deletion logs
  - User activity tracking
  - Command usage logging
  - Error logging

## Prerequisites

- Node.js v16.9.0 or higher
- Discord.js
- Discord Bot Token
- Basic understanding of Discord bot hosting

## Installation

1. Clone the repository:
```bash
git clone https://github.com/laggis/Clear-discord-bot.git
cd Clear-discord-bot
```

2. Install dependencies:
```bash
npm install
```

3. Configure the bot:
- Create a `config.js` file
- Add your bot token and settings

4. Start the bot:
```bash
node index.js
```

## Configuration

Example `config.js`:
```javascript
module.exports = {
    // Bot Configuration
    token: 'YOUR_BOT_TOKEN',
    prefix: '!',
    
    // Permission Settings
    requiredRole: 'Moderator',
    
    // Logging Configuration
    enableLogging: true,
    logChannel: 'bot-logs',
    
    // Clear Limits
    maxClearAmount: 100,
    
    // Cooldown Settings
    clearCooldown: 5000, // milliseconds
    
    // Custom Messages
    messages: {
        success: 'Successfully cleared {amount} messages',
        error: 'An error occurred while clearing messages',
        noPermission: 'You do not have permission to use this command'
    }
};
```

## Commands

### Basic Commands
- `!clear <amount>` - Clear specified number of messages
- `!clear user <@user> <amount>` - Clear messages from specific user
- `!clear bot <amount>` - Clear bot messages
- `!clear match <text> <amount>` - Clear messages containing text

### Advanced Commands
- `!clear before <messageID> <amount>` - Clear messages before specified message
- `!clear after <messageID> <amount>` - Clear messages after specified message
- `!clear between <startID> <endID>` - Clear messages between two messages
- `!clear help` - Show help menu

## Usage Examples

### Basic Message Clearing
```
!clear 10
```
Clears the last 10 messages in the channel

### User-Specific Clearing
```
!clear user @username 20
```
Clears the last 20 messages from specified user

### Content Filtering
```
!clear match "keyword" 50
```
Clears up to 50 messages containing "keyword"

## Permission Setup

Required Discord permissions:
- MANAGE_MESSAGES
- READ_MESSAGE_HISTORY
- VIEW_CHANNEL
- SEND_MESSAGES

Role hierarchy:
```javascript
const requiredPermissions = [
    'MANAGE_MESSAGES',
    'READ_MESSAGE_HISTORY'
];
```

## Error Handling

The bot includes robust error handling for:
- Invalid permissions
- Rate limiting
- API errors
- Invalid input
- Message age restrictions

## Logging System

Logged events include:
- Message deletions
- Command usage
- Error occurrences
- Permission denials

Example log format:
```javascript
{
    action: 'clear',
    user: 'Username#1234',
    channel: 'channel-name',
    amount: 10,
    timestamp: '2024-12-28T20:17:34Z'
}
```

## Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Best Practices

1. **Message Management:**
   - Use bulk delete for efficiency
   - Consider message age limits
   - Implement rate limiting
   - Cache message data when possible

2. **Permission Management:**
   - Regular permission audits
   - Clear permission hierarchy
   - Channel-specific restrictions
   - Role-based access control

3. **Error Prevention:**
   - Input validation
   - Rate limit handling
   - Proper error messages
   - Fallback mechanisms

## Troubleshooting

Common issues and solutions:

1. **Messages Not Clearing:**
   - Check bot permissions
   - Verify message age
   - Confirm command syntax
   - Check rate limits

2. **Permission Issues:**
   - Verify role hierarchy
   - Check channel permissions
   - Confirm bot permissions
   - Review user roles

## Planned Features

- Advanced filtering options
- Custom clear patterns
- Scheduled clearing
- Channel cleanup presets
- Enhanced logging options

## Support

Need help?
1. Check the [Issues](https://github.com/laggis/Clear-discord-bot/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Created by Laggis

## Notes

- Messages older than 14 days cannot be bulk deleted (Discord API limitation)
- Regular maintenance recommended
- Keep bot token secure
- Monitor Discord API changes
- Test in development server first
