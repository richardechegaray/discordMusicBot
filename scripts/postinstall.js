const fs = require("fs");
const path = require("path");

// Patch 1: @distube/yt-dlp — remove deprecated --no-call-home, download audio
//          to temp file instead of streaming (avoids YouTube throttling)
const ytdlpPath = path.join(__dirname, "..", "node_modules", "@distube", "yt-dlp", "dist", "index.js");
if (fs.existsSync(ytdlpPath)) {
  let src = fs.readFileSync(ytdlpPath, "utf8");

  // Remove noCallHome from all calls
  src = src.replace(/\s*noCallHome:\s*true,?\n?/g, "");

  // Replace getStreamURL to download to temp file instead of streaming
  const oldGetStream = `async getStreamURL(song) {
    if (!song.url) {
      throw new import_distube.DisTubeError("YTDLP_PLUGIN_INVALID_SONG", "Cannot get stream url from invalid song.");
    }
    const info = await json(song.url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      format: "ba/ba*"
    }).catch((e2) => {
      throw new import_distube.DisTubeError("YTDLP_ERROR", \`\${e2.stderr || e2}\`);
    });
    if (isPlaylist(info)) throw new import_distube.DisTubeError("YTDLP_ERROR", "Cannot get stream URL of a entire playlist");
    return info.url;
  }`;

  const newGetStream = `async getStreamURL(song) {
    if (!song.url) {
      throw new import_distube.DisTubeError("YTDLP_PLUGIN_INVALID_SONG", "Cannot get stream url from invalid song.");
    }
    const os = require("os");
    const path = require("path");
    const fs = require("fs");
    const { execFile } = require("child_process");
    const { promisify } = require("util");
    const execFileAsync = promisify(execFile);
    const tmpFile = path.join(os.tmpdir(), \`distube-\${Date.now()}-\${Math.random().toString(36).slice(2)}.webm\`);
    try {
      await execFileAsync(YTDLP_PATH, [
        song.url,
        "-f", "ba/ba*",
        "--no-warnings",
        "-o", tmpFile,
      ], { timeout: 60000, windowsHide: true });
    } catch (e2) {
      throw new import_distube.DisTubeError("YTDLP_ERROR", \`\${e2.stderr || e2}\`);
    }
    if (!fs.existsSync(tmpFile)) {
      throw new import_distube.DisTubeError("YTDLP_ERROR", "Failed to download audio");
    }
    setTimeout(() => { try { fs.unlinkSync(tmpFile); } catch {} }, 600000);
    const { pathToFileURL } = require("url");
    return pathToFileURL(tmpFile).href;
  }`;

  if (src.includes(oldGetStream)) {
    src = src.replace(oldGetStream, newGetStream);
  }

  fs.writeFileSync(ytdlpPath, src, "utf8");
  console.log("[postinstall] Patched @distube/yt-dlp");
}

// Patch 2: distube — fix file:// URL path resolution on Windows
const distubePath = path.join(__dirname, "..", "node_modules", "distube", "dist", "index.js");
if (fs.existsSync(distubePath)) {
  let src = fs.readFileSync(distubePath, "utf8");

  const oldLine = "opts.i = fileUrl.hostname + fileUrl.pathname;";
  const newLine = 'opts.i = require("url").fileURLToPath(fileUrl);';

  if (src.includes(oldLine)) {
    src = src.replace(oldLine, newLine);
    fs.writeFileSync(distubePath, src, "utf8");
    console.log("[postinstall] Patched distube file URL handling");
  }
}