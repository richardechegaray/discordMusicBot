const { SlashCommandBuilder } = require("discord.js");
const { nowPlayingEmbed } = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder().setName("np").setDescription("Show the Now Playing card"),

  async execute(interaction, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });
    await interaction.reply(nowPlayingEmbed(queue, queue.songs[0]));
  },
};