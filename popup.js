let intervalId = null;
let isTracking = false;

document.getElementById("start").addEventListener("click", () => {
  if (intervalId) return;

  chrome.runtime.sendMessage({ action: "start" });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" });
});


// Get Position web page
document.getElementById("selectArea").addEventListener("click", (e) => {
  e.stopPropagation();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: toggleTracking,
    });
  });
});

function toggleTracking() {
  window.isTracking = !window.isTracking;

  if (window.isTracking) {
    document.addEventListener("click", handleMouseClick);
  } 

  function handleMouseClick(e) {
    const pageX = e.pageX;
    const pageY = e.pageY;

    console.log(`Mouse clicked at X: ${pageX}, Y: ${pageY}`);
    document.removeEventListener("click", handleMouseClick);
    window.isTracking = false;
  }
}
