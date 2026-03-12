function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function buildProgressBar(current, total, length = 15) {
  const progress = Math.round((current / total) * length);
  const filled = "▓".repeat(progress);
  const empty = "░".repeat(length - progress);
  return `${filled}${empty} ${formatTime(current)} / ${formatTime(total)}`;
}

module.exports = { formatTime, buildProgressBar };