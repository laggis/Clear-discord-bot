# 🤖 Advanced Discord Clear Bot

A clean, production-ready Discord bot with an advanced `/clear` command that supports powerful filtering options.

---

## ✨ Commands

### `/clear` — Advanced Message Purge
| Option | Type | Description |
|---|---|---|
| `amount` | Integer (1–100) | Number of messages to delete (default: 10) |
| `user` | @mention | Only delete messages from this user |
| `bots` | true/false | Only delete messages sent by bots |
| `contains` | text | Only delete messages containing this string |
| `before` | Message ID | Delete messages before this message ID |
| `after` | Message ID | Delete messages after this message ID |
| `silent` | true/false | Skip the public confirmation message |

All options are combinable — e.g. `/clear amount:50 user:@spammer contains:"http"` deletes up to 50 messages from a specific user that contain a link.

> ⚠️ Discord only allows bulk-deleting messages **younger than 14 days**. Older messages are automatically skipped.

### `/ping`
Returns the bot's roundtrip latency and WebSocket heartbeat.

### `/botinfo`
Shows server count, uptime, ping, and runtime versions.

---

## 🚀 Setup

### 1. Clone & install
```bash
git clone <your-repo>
cd discord-bot
npm install
```

### 2. Create your `.env`
```bash
cp .env.example .env
```
Then fill in your bot token:
```
DISCORD_TOKEN=your_bot_token_here
```

### 3. Discord Developer Portal
1. Go to https://discord.com/developers/applications
2. Create a new application → **Bot** tab → copy the token
3. Under **Privileged Gateway Intents**, enable:
   - **Message Content Intent**
4. **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Manage Messages`, `Read Message History`, `Send Messages`, `View Channels`
5. Copy the generated URL and invite the bot to your server

### 4. Run
```bash
npm start
# or for development with auto-restart:
npm run dev
```

Slash commands register globally on startup (may take up to 1 hour to propagate to all servers, instant in the bot's own server via guild commands if you switch to that).

---

## 🔒 Permissions Required
- `Manage Messages` — to delete messages
- `Read Message History` — to fetch messages
- `Send Messages` — to post the confirmation embed
- `View Channel` — to access the channel

Both the **bot** and the **user running the command** need `Manage Messages`.
