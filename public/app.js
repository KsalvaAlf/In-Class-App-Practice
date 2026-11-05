"use strict";

const connectButton = document.getElementById("connectButton");
const characterInput = document.getElementById("characterInput");
const inputPanel = document.getElementById("inputPanel");
const inputMessage = document.getElementById("inputMessage");
const stage = document.getElementById("animationStage");
const errorBanner = document.getElementById("errorBanner");
const serverOverlay = document.getElementById("serverOverlay");

let serialPort = null;
let serialReader = null;
let serialText = "";
let activeAnimation = null;
let queuedAction = null;
let lastCharacter = "";
let logRetryTimer = null;
const pendingLogs = [];

function showError(message, duration = 5000) {
  errorBanner.textContent = message;
  errorBanner.classList.add("visible");
  window.clearTimeout(showError.timeout);
  showError.timeout = window.setTimeout(() => {
    errorBanner.classList.remove("visible");
  }, duration);
}

function currentCharacter() {
  const value = characterInput.value;
  return Array.from(value).length === 1 ? value : null;
}

function validateCharacter() {
  const value = currentCharacter();
  if (!value) {
    inputMessage.textContent = "Enter exactly one character before pressing the button.";
    return false;
  }
  inputMessage.textContent = "Press the ESP32 button to begin";
  return true;
}

characterInput.addEventListener("input", () => {
  validateCharacter();
});

async function checkServer() {
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    if (!response.ok) throw new Error("Server health check failed");
    serverOverlay.hidden = true;
    return true;
  } catch {
    serverOverlay.hidden = false;
    return false;
  }
}

async function postLog(event) {
  pendingLogs.push(event);
  await flushLogs();
}

async function flushLogs() {
  if (!pendingLogs.length) return;
  try {
    const event = pendingLogs[0];
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
    if (!response.ok) throw new Error("Log request failed");
    pendingLogs.shift();
    if (!pendingLogs.length && logRetryTimer) {
      window.clearInterval(logRetryTimer);
      logRetryTimer = null;
    }
    await flushLogs();
  } catch {
    showError("Activity log could not be written. Retrying...");
    if (!logRetryTimer) {
      logRetryTimer = window.setInterval(flushLogs, 3000);
    }
    window.setTimeout(checkServer, 1000);
  }
}

async function connectSerial() {
  if (!("serial" in navigator)) {
    showError("Web Serial is unavailable. Use desktop Chrome or Edge in Windows.");
    connectButton.textContent = "Web Serial unavailable";
    connectButton.disabled = true;
    return;
  }

  try {
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 115200 });
    connectButton.hidden = true;
    showError("ESP32 connected", 2500);
    readSerial();
  } catch (error) {
    serialPort = null;
    let message = "ESP32 connection could not open.";
    if (error.name === "NotFoundError") {
      message = "No USB device was selected or permission was cancelled.";
    } else if (error.name === "SecurityError") {
      message = "USB Serial permission was blocked by the browser.";
    } else if (error.name === "NetworkError") {
      message = "The ESP32 port is busy. Close Arduino Serial Monitor, PlatformIO Serial Monitor, or any other app using the USB port.";
    } else if (error.name === "InvalidStateError") {
      message = "The ESP32 USB port is already open or another browser tab is using it.";
    } else if (error.message) {
      message = `ESP32 connection failed: ${error.message}`;
    }
    showError(message, 12000);
    connectButton.hidden = false;
  }
}

async function readSerial() {
  if (!serialPort?.readable) return;
  serialText = "";
  const decoder = new TextDecoder();
  try {
    serialReader = serialPort.readable.getReader();
    while (true) {
      const { value, done } = await serialReader.read();
      if (done) break;
      serialText += decoder.decode(value, { stream: true });
      const lines = serialText.split(/\r?\n/);
      serialText = lines.pop() || "";
      for (const line of lines) handleSerialEvent(line.trim());
    }
    handleSerialDisconnect();
  } catch {
    handleSerialDisconnect();
  } finally {
    if (serialReader) {
      serialReader.releaseLock();
      serialReader = null;
    }
  }
}

async function closeSerial() {
  try {
    if (serialReader) {
      await serialReader.cancel();
      serialReader = null;
    }
    if (serialPort) await serialPort.close();
  } catch {
    // The browser reports serial loss through the read loop.
  }
}

function handleSerialDisconnect() {
  serialPort = null;
  connectButton.hidden = false;
  connectButton.textContent = "Reconnect ESP32";
  showError("ESP32 disconnected. Stop activities and reconnect.", 10000);
  activeAnimation = null;
  queuedAction = null;
  stage.replaceChildren();
  inputPanel.classList.remove("hidden");
}

function handleSerialEvent(message) {
  showError(`ESP32 event received: ${message}`, 3000);

  const normalized = message.toLowerCase();
  let actionName = null;

  if (normalized === "red_burst" ||
      normalized === "1" ||
      normalized.includes("colour is now 1") ||
      normalized.includes("color is now 1")) {
    actionName = "RED_BURST";
  } else if (normalized === "side_explosion" ||
             normalized === "2" ||
             normalized.includes("colour is now 2") ||
             normalized.includes("color is now 2")) {
    actionName = "SIDE_EXPLOSION";
  } else {
    return;
  }

  const action = actionName === "RED_BURST" ? {
    name: "RED_BURST",
    pressCount: 1
  } : {
    name: "SIDE_EXPLOSION",
    pressCount: 2
  };

  if (activeAnimation) {
    queuedAction = action;
    return;
  }
  runAction(action);
}

async function runAction(action) {
  if (!validateCharacter()) {
    showError("Enter exactly one character in the center before pressing the button.", 8000);
    return;
  }

  const character = characterInput.value;
  activeAnimation = action.name;
  inputPanel.classList.add("hidden");
  stage.replaceChildren();

  postLog({
    character,
    pressCount: action.pressCount,
    animation: action.name,
    result: "started"
  });

  if (action.name === "RED_BURST") {
    await redBurst();
  } else {
    await sideExplosion(character);
  }

  postLog({
    character,
    pressCount: action.pressCount,
    animation: action.name,
    result: "completed"
  });

  activeAnimation = null;
  if (action.name === "SIDE_EXPLOSION") {
    stage.replaceChildren();
    finishCharacterSelection(character);
  } else {
    stage.replaceChildren();
    inputPanel.classList.remove("hidden");
    characterInput.focus();
  }

  if (queuedAction) {
    const next = queuedAction;
    queuedAction = null;
    runAction(next);
  }
}

function wait(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

async function redBurst() {
  const burst = document.createElement("div");
  burst.className = "red-burst";
  stage.append(burst);
  await wait(2000);
  burst.remove();
}

async function sideExplosion(character) {
  const blue = document.createElement("div");
  blue.className = "side-wave blue";
  const green = document.createElement("div");
  green.className = "side-wave green";
  stage.append(blue, green);
  await wait(3000);

  blue.remove();
  green.remove();
  const collision = document.createElement("div");
  collision.className = "collision";
  stage.append(collision);
  await wait(1000);
  collision.remove();

  const appleWrap = document.createElement("div");
  appleWrap.className = "apple-wrap";
  appleWrap.innerHTML = `
    <div class="apple-stem"></div>
    <div class="apple-leaf"></div>
    <div class="apple"></div>
    <div class="apple-character"></div>
  `;
  appleWrap.querySelector(".apple-character").textContent = character;
  stage.append(appleWrap);
  await wait(4000);
  appleWrap.remove();
}

function finishCharacterSelection(character) {
  lastCharacter = character;
  characterInput.value = "";
  inputPanel.classList.remove("hidden");

  const keepSame = window.confirm(
    `Keep the same character "${character}"? Choose Cancel to enter a different character.`
  );
  if (keepSame) {
    characterInput.value = character;
    inputMessage.textContent = "Press the ESP32 button to begin";
    characterInput.focus();
  } else {
    characterInput.value = "";
    inputMessage.textContent = "Enter exactly one new character.";
    characterInput.focus();
  }
}

connectButton.addEventListener("click", connectSerial);
serialPort?.addEventListener?.("disconnect", handleSerialDisconnect);

window.addEventListener("beforeunload", () => {
  closeSerial();
});

window.setInterval(checkServer, 5000);
checkServer().then(serverReady => {
  if (serverReady) characterInput.focus();
});
