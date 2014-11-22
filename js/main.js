chrome.app.runtime.onLaunched.addListener(function() {

  window.open('pinger.html', {
    id: "PingerWindowId"
  });
});