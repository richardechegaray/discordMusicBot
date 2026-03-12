const { SlashCommandBuilder } = require("discord.js");
const { queueEmbed } = require("../utils/embeds");

const queue = {
  data: new SlashCommandBuilder().setName("queue").setDescription("Display the current queue"),
  async execute(interaction, distube) {
    const q = distube.getQueue(interaction.guildId);
    if (!q) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });
    await interaction.reply(queueEmbed(q));
  },
};

const shuffle = {
  data: new SlashCommandBuilder().setName("shuffle").setDescription("Randomise the order of queued tracks"),
  async execute(interaction, distube) {
    const q = distube.getQueue(interaction.guildId);
    if (!q) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });
    await q.shuffle();
    await interaction.reply("🔀 Queue shuffled.");
  },
};

const remove = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a track by its queue position")
    .addIntegerOption((opt) =>
      opt.setName("pos").setDescription("1-based position in queue").setRequired(true).setMinValue(1)
    ),
  async execute(interaction, distube) {
    const q = distube.getQueue(interaction.guildId);
    if (!q) return interaction.reply({ content: "Nothing is playing.", ephemeral: true });

    const pos = interaction.options.getInteger("pos");
    if (pos >= q.songs.length) {
      return interaction.reply({ content: `Invalid position. Queue has ${q.songs.length - 1} upcoming song(s).`, ephemeral: true });
    }

    const removed = q.songs.splice(pos, 1)[0];
    await interaction.reply(`Removed **${removed.name}** from position ${pos}.`);
  },
};

module.exports = [queue, shuffle, remove];