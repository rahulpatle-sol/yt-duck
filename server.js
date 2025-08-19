import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import ytdl from "@distube/ytdl-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 📂 Default Download Folder (system Downloads dir)
const DEFAULT_DOWNLOAD_PATH = path.join(os.homedir(), "Downloads");

/* ===================================================
   🎯 API ROUTES
=================================================== */

// 🔎 Get video info
app.post("/info", async (req, res) => {
  try {
    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "❌ Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(url);

    // 🎥 Video formats
    const videoFormats = ytdl.filterFormats(info.formats, "video").map((f) => ({
      quality: f.qualityLabel || "Unknown",
      itag: f.itag,
      hasAudio: f.hasAudio,
      hasVideo: f.hasVideo,
      container: f.container,
      size: f.contentLength
        ? (f.contentLength / 1024 / 1024).toFixed(2) + " MB"
        : "Unknown",
    }));

    // 🎵 Audio formats
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly").map((f) => ({
      bitrate: f.audioBitrate + " kbps",
      itag: f.itag,
      container: f.container,
      size: f.contentLength
        ? (f.contentLength / 1024 / 1024).toFixed(2) + " MB"
        : "Unknown",
    }));

    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      videoFormats,
      audioFormats,
    });
  } catch (err) {
    console.error("❌ /info error:", err);
    res.status(500).json({ error: "Failed to fetch info" });
  }
});

// 🎧 STREAM AUDIO
app.get("/stream/audio", async (req, res) => {
  try {
    const { url, itag } = req.query;

    if (!ytdl.validateURL(url)) {
      return res.status(400).send("Invalid YouTube URL");
    }

    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: itag });

    res.setHeader("Content-Type", "audio/m4a");
    ytdl(url, { format }).pipe(res);
  } catch (err) {
    console.error("❌ /stream/audio error:", err);
    res.status(500).send("Audio streaming failed");
  }
});

// 🎥 STREAM VIDEO
app.get("/stream/video", async (req, res) => {
  try {
    const { url, itag } = req.query;

    if (!ytdl.validateURL(url)) {
      return res.status(400).send("Invalid YouTube URL");
    }

    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: itag });

    res.setHeader("Content-Type", "video/mp4");
    ytdl(url, { format }).pipe(res);
  } catch (err) {
    console.error("❌ /stream/video error:", err);
    res.status(500).send("Video streaming failed");
  }
});

// 📥 DOWNLOAD
// 📥 DOWNLOAD (fixed for mobile & desktop)
app.post("/download", async (req, res) => {
  try {
    const { url, itag } = req.body;

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: itag });

    const safeTitle = info.videoDetails.title.replace(/[<>:"/\\|?*]+/g, "");
    const fileName = `${safeTitle}.${format.container}`;

    // 📱 For mobile → send as attachment (browser saves itself)
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", format.mimeType || "application/octet-stream");

    // Pipe stream directly to response
    ytdl(url, { format }).pipe(res);

  } catch (err) {
    console.error("❌ /download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

/* ===================================================
   🔵 FRONTEND SERVE
=================================================== */
app.use(express.static("public")); // Always at the end

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
