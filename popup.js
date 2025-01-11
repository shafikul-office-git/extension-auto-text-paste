let intervalId = null;

document.getElementById("start").addEventListener("click", () => {
  if (intervalId) return; // If already running, prevent multiple intervals

  chrome.runtime.sendMessage({ action: "start" });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" });
});
