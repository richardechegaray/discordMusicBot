const { queueEmbed } = require("../utils/embeds");

async function handleButton(interaction, distube) {
  const queue = distube.getQueue(interaction.guildId);

  if (!queue) {
    return interaction.reply({ content: "Nothing is playing.", ephemeral: true });
  }

  try {
    switch (interaction.customId) {
      case "btn_pause":
        if (queue.paused) {
          await queue.resume();
          await interaction.reply("▶ Resumed.");
        } else {
          await queue.pause();
          await interaction.reply("⏸ Paused.");
        }
        break;

      case "btn_skip":
        if (queue.songs.length <= 1) {
          await interaction.reply({ content: "No more songs in the queue to skip to.", ephemeral: true });
        } else {
          await queue.skip();
          await interaction.reply("⏭ Skipped.");
        }
        break;

      case "btn_stop":
        await queue.stop();
        await interaction.reply("⏹ Stopped and cleared the queue.");
        break;

      case "btn_queue":
        await interaction.reply({ ...queueEmbed(queue, 10), ephemeral: true });
        break;

      case "btn_vol_down": {
        const downVol = Math.max(10, queue.volume - 10);
        queue.setVolume(downVol);
        await interaction.reply({ content: `🔉 Volume: **${downVol}%**`, ephemeral: true });
        break;
      }

      case "btn_vol_up": {
        const upVol = Math.min(100, queue.volume + 10);
        queue.setVolume(upVol);
        await interaction.reply({ content: `🔊 Volume: **${upVol}%**`, ephemeral: true });
        break;
      }
    }
  } catch (err) {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: `Error: ${err.message}`, ephemeral: true });
    }
  }
}

module.exports = { handleButton };