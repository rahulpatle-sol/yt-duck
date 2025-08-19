
  const urlInput = document.getElementById("urlInput");
  const getInfoBtn = document.getElementById("getInfo");
  const infoBox = document.getElementById("info");
  const titleEl = document.getElementById("title");
  const thumbEl = document.getElementById("thumbnail");
  const formatSelect = document.getElementById("formatSelect");
  const dlVideoBtn = document.getElementById("dlVideo");
  const dlAudioBtn = document.getElementById("dlAudio");
  const playAudioBtn = document.getElementById("playAudio");
  const audioPlayer = document.getElementById("audioPlayer");

  let currentUrl = "";
  let audioFormats = [];
  let videoFormats = [];

  // 🚀 Get video/audio info
  getInfoBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) return alert("⚠️ Please enter a URL!");

    try {
      const res = await fetch("/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      if (data.error) return alert(data.error);

      currentUrl = url;
      titleEl.textContent = data.title;
      thumbEl.src = data.thumbnail;

      videoFormats = data.videoFormats;
      audioFormats = data.audioFormats;

      formatSelect.innerHTML = `
        <optgroup label="🎥 Video">
          ${videoFormats.map(f => `<option value="v-${f.itag}">${f.quality} (${f.size})</option>`).join("")}
        </optgroup>
        <optgroup label="🎵 Audio">
          ${audioFormats.map(f => `<option value="a-${f.itag}">${f.bitrate} (${f.size})</option>`).join("")}
        </optgroup>
      `;

      infoBox.style.display = "block";
    } catch (err) {
      console.error(err);
      alert("❌ Failed to fetch video info");
    }
  });

  // 🎬 Download Video
  dlVideoBtn.addEventListener("click", async () => {
    const selected = formatSelect.value;
    if (!selected.startsWith("v-")) return alert("⚠️ Select a video format!");
    const itag = selected.split("-")[1];

    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentUrl, itag })
    });

    const data = await res.json();
    alert(`🎬 Download started: ${data.file}\n📂 Saved to: ${data.path}`);
  });

  // 🎵 Download Audio
  dlAudioBtn.addEventListener("click", async () => {
    const selected = formatSelect.value;
    if (!selected.startsWith("a-")) return alert("⚠️ Select an audio format!");
    const itag = selected.split("-")[1];

    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentUrl, itag })
    });

    const data = await res.json();
    alert(`🎵 Download started: ${data.file}\n📂 Saved to: ${data.path}`);
  });

  // ▶️ Play Audio Preview
  playAudioBtn.addEventListener("click", () => {
    const selected = formatSelect.value;
    if (!selected.startsWith("a-")) return alert("⚠️ Select an audio format to preview!");
    const itag = selected.split("-")[1];

    audioPlayer.src = `/stream/audio?url=${encodeURIComponent(currentUrl)}&itag=${itag}`;
    audioPlayer.play();
  });
    // 🎧 Audio Player Control
    // 
    audioPlayer.addEventListener("error", () => {
      alert("❌ Failed to play audio. Please try a different format.");
    });
    
    playVideoBtn.addEventListener("click", () => {
      const selected = formatSelect.value;
      if (!selected.startsWith("v-")) return alert("⚠️ Select a video format to preview!");
      const itag = selected.split("-")[1];

      const videoPlayer = document.getElementById("videopalyer");
      videoPlayer.src = `/stream/video?url=${encodeURIComponent(currentUrl)}&itag=${itag}`;
      videoPlayer.style.display = "block";
      videoPlayer.play();
    });
 
