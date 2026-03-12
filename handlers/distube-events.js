const { nowPlayingEmbed } = require("../utils/embeds");
const { formatTime } = require("../utils/helpers");

function registerDistubeEvents(distube) {
  distube.on("playSong", (queue, song) => {
    queue.textChannel.send(nowPlayingEmbed(queue, song));
  });

  distube.on("addSong", (queue, song) => {
    queue.textChannel.send(
      `Added **${song.name}** — ${formatTime(song.duration)} (position ${queue.songs.length - 1} in queue)`
    );
  });

  distube.on("addList", (queue, playlist) => {
    queue.textChannel.send(
      `Added playlist **${playlist.name}** — ${playlist.songs.length} song(s)`
    );
  });

  distube.on("finish", (queue) => {
    console.log("DisTube: queue finished");
    queue.textChannel.send("Queue finished! Use `/play` to add more songs.");
  });

  distube.on("disconnect", (queue) => {
    console.log("DisTube: disconnected");
    queue.textChannel.send("Disconnected from voice channel.");
  });

  distube.on("empty", (queue) => {
    console.log("DisTube: voice channel empty");
    queue.textChannel.send("Everyone left the voice channel — stopping playback.");
  });

  distube.on("error", (error, queue) => {
    console.error("DisTube error:", error);
    if (queue?.textChannel) {
      queue.textChannel.send(`An error occurred: ${error.message}`);
    }
  });

  distube.on("ffmpegDebug", (debug) => {
    if (/error|fail|abort/i.test(debug)) {
      console.error("ffmpeg debug:", debug);
    }
  });
}

module.exports = { registerDistubeEvents };