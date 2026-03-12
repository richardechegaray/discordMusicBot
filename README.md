# Discord Music Bot

A Discord bot that plays YouTube audio in voice channels using slash commands and button controls.

## Features

- `/play <query or URL>` — Play a song by YouTube URL or search keyword
- `/pause`, `/resume`, `/skip`, `/stop` — Playback controls
- `/volume <1-100>` — Set volume
- `/queue` — View the current queue
- `/shuffle` — Shuffle the queue
- `/remove <position>` — Remove a song from the queue
- `/np` — Show the now-playing card with button controls

Button controls on the now-playing embed: pause/resume, skip, stop, view queue, volume up/down.

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `DISCORD_TOKEN` | Your bot token from the [Discord Developer Portal](https://discord.com/developers/applications) |
   | `CLIENT_ID` | Your bot's application/client ID |
   | `MUSIC_CHANNEL_ID` | Channel ID to restrict the bot to (optional) |

3. Start the bot:
   ```
   npm start
   ```

## Requirements

- Node.js 18+
- A Discord bot with the following gateway intents enabled: Guilds, Guild Messages, Guild Voice States, Message Content