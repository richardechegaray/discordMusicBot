const { SlashCommandBuilder } = require("discord.js");
const { execFile } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execFileAsync = promisify(execFile);
const ytdlpBin = path.resolve(__dirname, "../node_modules/@distube/yt-dlp/bin/yt-dlp.exe");

async function searchYouTube(query) {
  const { stdout } = await execFileAsync(ytdlpBin, [
    `ytsearch1:${query}`,
    "--print", "webpage_url",
    "--no-warnings",
    "--skip-download",
  ]);
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

    await interaction.reply({ content: `Searching for **${query}**...` });

    try {
      if (!/^https?:\/\//.test(query)) {
        query = await searchYouTube(query);
      }
      await distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
      });
      await interaction.deleteReply().catch(() => {});
    } catch (err) {
      await interaction.editReply(`Something went wrong: ${err.message}`).catch(() => {});
    }
  },
};