require("dotenv").config();
const ffmpegPath = require("ffmpeg-static");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { handleButton } = require("./handlers/buttons");
const { registerDistubeEvents } = require("./handlers/distube-events");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin({ update: true })],
  ffmpeg: { path: ffmpegPath },
});

// Load commands
client.commands = new Collection();
const commandFiles = [
  require("./commands/play"),
  require("./commands/np"),
  ...require("./commands/controls"),
  ...require("./commands/queue"),
];

const slashCommands = [];
for (const cmd of commandFiles) {
  client.commands.set(cmd.data.name, cmd);
  slashCommands.push(cmd.data.toJSON());
}

// Register slash commands and wire events on ready
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await client.application.commands.set(slashCommands);
  console.log(`Registered ${slashCommands.length} slash commands.`);
});

// Handle slash commands
const MUSIC_CHANNEL_ID = process.env.MUSIC_CHANNEL_ID;

client.on("interactionCreate", async (interaction) => {
  if (MUSIC_CHANNEL_ID && interaction.channelId !== MUSIC_CHANNEL_ID) {
    return interaction.reply({ content: `This bot only works in <#${MUSIC_CHANNEL_ID}>.`, ephemeral: true });
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, distube);
    } catch (err) {
      console.error(`Command error [${interaction.commandName}]:`, err);
      const reply = { content: "Something went wrong.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  }

  if (interaction.isButton()) {
    await handleButton(interaction, distube);
  }
});

// Wire DisTube events
registerDistubeEvents(distube);

client.login(process.env.DISCORD_TOKEN);