const { nowPlayingEmbed } = require("../utils/embeds");
const { formatTime } = require("../utils/helpers");

function send(queue, message) {
  queue.textChannel?.send(message).catch((err) => console.error("Failed to send message:", err.message));
}

function registerDistubeEvents(distube) {
  distube.on("playSong", (queue, song) => {
    send(queue, nowPlayingEmbed(queue, song));
  });

  distube.on("addSong", (queue, song) => {
    send(queue,
      `Added **${song.name}** — ${formatTime(song.duration)} (position ${queue.songs.length - 1} in queue)`
    );
  });

  distube.on("addList", (queue, playlist) => {
    send(queue,
      `Added playlist **${playlist.name}** — ${playlist.songs.length} song(s)`
    );
  });

  distube.on("finish", (queue) => {
    console.log("DisTube: queue finished");
    send(queue, "Queue finished! Use `/play` to add more songs.");
  });

  distube.on("disconnect", (queue) => {
    console.log("DisTube: disconnected");
    send(queue, "Disconnected from voice channel.");
  });

  distube.on("empty", (queue) => {
    console.log("DisTube: voice channel empty");
    send(queue, "Everyone left the voice channel — stopping playback.");
    queue.voice.leave();
  });

  distube.on("error", (error, queue) => {
    console.error("DisTube error:", error);
    if (queue) {
      send(queue, `An error occurred: ${error.message}`);
    }
  });

  distube.on("ffmpegDebug", (debug) => {
    if (/error|fail|abort/i.test(debug)) {
      console.error("ffmpeg debug:", debug);
    }
  });
}

module.exports = { registerDistubeEvents };