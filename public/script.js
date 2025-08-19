const fetchBtn = document.getElementById("fetchBtn");
const fetchLoader = document.getElementById("fetchLoader");
const optionsPanel = document.getElementById("optionsPanel");
const audioOptions = document.getElementById("audioOptions");
const videoOptions = document.getElementById("videoOptions");
const downloadingPanel = document.getElementById("downloadingPanel");

fetchBtn.addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value;
  if (!url) return alert("Please enter a YouTube URL");

  fetchLoader.classList.remove("hidden");
  optionsPanel.classList.add("hidden");

  try {
    const res = await fetch("/fetch?url=" + encodeURIComponent(url));
    const data = await res.json();

    fetchLoader.classList.add("hidden");
    optionsPanel.classList.remove("hidden");

    audioOptions.innerHTML = "";
    videoOptions.innerHTML = "";

    data.audio.forEach(format => {
      const btn = document.createElement("button");
      btn.innerText = `${format.itag} - ${format.mimeType}`;
      btn.onclick = () => startDownload(url, format.itag, "audio");
      audioOptions.appendChild(btn);
    });

    data.video.forEach(format => {
      const btn = document.createElement("button");
      btn.innerText = `${format.qualityLabel} - ${format.mimeType}`;
      btn.onclick = () => startDownload(url, format.itag, "video");
      videoOptions.appendChild(btn);
    });
  } catch (err) {
    fetchLoader.classList.add("hidden");
    alert("Error fetching formats");
  }
});

function startDownload(url, itag, type) {
  downloadingPanel.classList.remove("hidden");
  fetch(`/download?url=${encodeURIComponent(url)}&itag=${itag}&type=${type}`)
    .then(() => {
      setTimeout(() => {
        downloadingPanel.classList.add("hidden");
        alert("Download Completed ✅");
      }, 3000);
    })
    .catch(() => {
      downloadingPanel.classList.add("hidden");
      alert("Download Failed ❌");
    });
}
