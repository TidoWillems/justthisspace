(function () {
  const canPost = typeof parent !== "undefined" && parent !== window;
  const ts = () => new Date().toLocaleTimeString();

  const logBuffer = [];      // Puffer für letzte Einträge
  const maxEntries = 100;    // Anzahl merken
  function store(msg) {
    const line = `[${ts()}] ${msg}`;
    logBuffer.push(line);
    if (logBuffer.length > maxEntries) logBuffer.shift();
    if (canPost) parent.postMessage(line, "*");
  }

  // Globale Funktion für gezielte Debug-Ausgaben
  window.debug = store;

  // JS-Fehler abfangen
  window.onerror = function (message, source, lineno, colno) {
    store(`ERROR: ${message} @ ${source}:${lineno}:${colno}`);
  };

  // Promise-Rejections abfangen
  window.addEventListener("unhandledrejection", event => {
    store(`PROMISE: ${event.reason}`);
  });

  // Konsole umleiten
  ["log", "warn", "error"].forEach(level => {
    const orig = console[level];
    console[level] = function (...args) {
      store(`${level.toUpperCase()}: ${args.join(" ")}`);
      orig.apply(console, args);
    };
  });

  // Export-Funktion zum Herunterladen der letzten Einträge
  window.exportDebugLog = () => {
    const blob = new Blob([logBuffer.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "debug-log.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  store("debug.js initialisiert");
})();
