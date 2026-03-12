const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { formatTime, buildProgressBar } = require("./helpers");

function nowPlayingEmbed(queue, song) {
  const embed = new EmbedBuilder()
    .setColor(0x1db954)
    .setTitle(song.name)
    .setURL(song.url)
    .setThumbnail(song.thumbnail)
    .addFields(
      { name: "Duration", value: formatTime(song.duration), inline: true },
      { name: "Requested by", value: `${song.user}`, inline: true },
      { name: "Volume", value: `${queue.volume}%`, inline: true },
      { name: "Queue", value: `${queue.songs.length - 1} remaining`, inline: true },
      { name: "Progress", value: buildProgressBar(0, song.duration) }
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_pause")
      .setLabel("⏸ Pause")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("btn_skip")
      .setLabel("⏭ Skip")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("btn_stop")
      .setLabel("⏹ Stop")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("btn_queue")
      .setLabel("📋 Queue")
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_vol_down")
      .setLabel("🔉 Vol −10")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("btn_vol_up")
      .setLabel("🔊 Vol +10")
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2] };
}

function queueEmbed(queue, maxEntries = 20) {
  const songs = queue.songs;
  const current = songs[0];
  const upcoming = songs.slice(1, maxEntries + 1);

  let description = `**Now Playing:**\n[${current.name}](${current.url}) — ${formatTime(current.duration)}\n\n`;

  if (upcoming.length > 0) {
    description += "**Up Next:**\n";
    upcoming.forEach((song, i) => {
      description += `${i + 1}. [${song.name}](${song.url}) — ${formatTime(song.duration)}\n`;
    });
  } else {
    description += "*No more songs in queue.*";
  }

  if (songs.length > maxEntries + 1) {
    description += `\n...and ${songs.length - maxEntries - 1} more`;
  }

  const embed = new EmbedBuilder()
    .setColor(0x1db954)
    .setTitle("Music Queue")
    .setDescription(description)
    .setFooter({ text: `${songs.length} song(s) in queue` });

  return { embeds: [embed] };
}

module.exports = { nowPlayingEmbed, queueEmbed };