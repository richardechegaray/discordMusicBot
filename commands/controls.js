const { SlashCommandBuilder } = require("discord.js");

const pause = {
  data: new SlashCommandBuilder().setName("pause").setDescription("Pause the current track"),
  async execute(interaction, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });
    await queue.pause();
    await interaction.reply("⏸ Paused.");
  },
};

const resume = {
  data: new SlashCommandBuilder().setName("resume").setDescription("Resume a paused track"),
  async execute(interaction, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });
    await queue.resume();
    await interaction.reply("▶ Resumed.");
  },
};

const skip = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip to the next song in the queue"),
  async execute(interaction, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });

    if (queue.songs.length <= 1) {
      return interaction.reply({ content: "No more songs in the queue to skip to.", ephemeral: true });
    }
    await queue.skip();
    await interaction.reply("⏭ Skipped.");
  },
};

const stop = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop playback and clear the queue"),
  async execute(interaction, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });
    await queue.stop();
    await interaction.reply("⏹ Stopped and cleared the queue.");
  },
};

const volume = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the playback volume")
    .addIntegerOption((opt) =>
      opt.setName("level").setDescription("Volume 1-100").setRequired(true).setMinValue(1).setMaxValue(100)
    ),
  async execute(interaction, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });
    const level = interaction.options.getInteger("level");
    queue.setVolume(level);
    await interaction.reply(`🔊 Volume set to **${level}%**.`);
  },
};

module.exports = [pause, resume, skip, stop, volume];