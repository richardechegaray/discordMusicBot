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
client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await client.application.commands.set(slashCommands);
  console.log(`Registered ${slashCommands.length} slash commands.`);
});

// Handle slash commands
const MUSIC_CHANNEL_ID = process.env.MUSIC_CHANNEL_ID;

// Commands/buttons that change playback require being in the bot's voice channel
const VOICE_COMMANDS = new Set(["pause", "resume", "skip", "stop", "volume", "shuffle", "remove"]);

function needsSameVoice(interaction) {
  if (interaction.isChatInputCommand()) return VOICE_COMMANDS.has(interaction.commandName);
  if (interaction.isButton()) return interaction.customId !== "btn_queue";
  return false;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.inGuild()) {
    if (interaction.isRepliable()) await interaction.reply({ content: "Use me in a server.", ephemeral: true });
    return;
  }

  if (MUSIC_CHANNEL_ID && interaction.channelId !== MUSIC_CHANNEL_ID) {
    return interaction.reply({ content: `This bot only works in <#${MUSIC_CHANNEL_ID}>.`, ephemeral: true });
  }

  const botChannelId = interaction.guild.members.me?.voice.channelId;
  if (needsSameVoice(interaction) && botChannelId && interaction.member.voice.channelId !== botChannelId) {
    return interaction.reply({ content: `Join <#${botChannelId}> to control the music.`, ephemeral: true });
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

// Leave if the bot's voice channel has no humans for a minute
const EMPTY_TIMEOUT_MS = 60_000;
const emptyTimers = new Map();

function hasHumans(channel) {
  return channel.members.some((m) => !m.user.bot);
}

client.on("voiceStateUpdate", (oldState) => {
  const guild = oldState.guild;
  const botChannel = guild.members.me?.voice.channel;

  if (!botChannel || hasHumans(botChannel)) {
    clearTimeout(emptyTimers.get(guild.id));
    emptyTimers.delete(guild.id);
    return;
  }
  if (emptyTimers.has(guild.id)) return;

  emptyTimers.set(guild.id, setTimeout(() => {
    emptyTimers.delete(guild.id);
    const channel = guild.members.me?.voice.channel;
    if (!channel || hasHumans(channel)) return;
    const queue = distube.getQueue(guild.id);
    if (queue) distube.emit("empty", queue);
    else distube.voices.leave(guild.id);
  }, EMPTY_TIMEOUT_MS));
});

// Wire DisTube events
registerDistubeEvents(distube);

// Log instead of crashing on stray errors (e.g. missing send permissions, expired interactions)
client.on("error", (err) => console.error("Client error:", err));
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));

client.login(process.env.DISCORD_TOKEN);