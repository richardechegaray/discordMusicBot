const { SlashCommandBuilder } = require("discord.js");
const { execFile } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execFileAsync = promisify(execFile);
const ytdlpBin = path.resolve(
  __dirname,
  `../node_modules/@distube/yt-dlp/bin/yt-dlp${process.platform === "win32" ? ".exe" : ""}`
);

async function searchYouTube(query) {
  const { stdout } = await execFileAsync(ytdlpBin, [
    `ytsearch1:${query}`,
    "--print", "webpage_url",
    "--no-warnings",
    "--skip-download",
  ], { timeout: 30000, windowsHide: true });
  const url = stdout.trim();
  if (!url) throw new Error("No results found");
  return url;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a YouTube URL or search by keyword")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("YouTube URL or search term").setRequired(true)
    ),

  async execute(interaction, distube) {
    let query = interaction.options.getString("query");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: "You need to be in a voice channel!", ephemeral: true });
    }

    const existing = distube.getQueue(interaction.guildId);
    const botChannel = interaction.guild.members.me.voice.channel;
    if (existing && !botChannel) {
      // Bot was kicked/disconnected but the old queue hasn't been cleaned up yet
      distube.voices.leave(interaction.guildId);
    } else if (botChannel && botChannel.id !== voiceChannel.id) {
      if (botChannel.members.some((m) => !m.user.bot)) {
        return interaction.reply({ content: `I'm already playing in <#${botChannel.id}> — join there.`, ephemeral: true });
      }
      // Nobody is listening where the bot is, so it moves to the requester's channel (below)
    }

    await interaction.reply({ content: `Searching for **${query}**...` });

    try {
      if (!/^https?:\/\//.test(query)) {
        query = await searchYouTube(query);
      }
      const queue = distube.getQueue(interaction.guildId);
      if (queue && queue.voice.channelId !== voiceChannel.id) {
        queue.voice.channel = voiceChannel;
      }
      await distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
      });
      await interaction.deleteReply().catch(() => {});
    } catch (err) {
      console.error(`Play error [${query}]:`, err);
      await interaction.editReply(`Something went wrong: ${err.message}`).catch(() => {});
    }
  },
};