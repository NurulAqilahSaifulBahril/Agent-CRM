// Desktop shell: starts the bundled Next.js server on this PC and shows it in a window.
// Agent and lead data is saved in the user's app-data folder, not in the install folder.

const { app, BrowserWindow, dialog, shell } = require("electron");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");

// A steady port keeps the sign-in cookie across launches; fall back if it's taken.
const PREFERRED_PORT = 3210;

let serverProcess = null;
let mainWindow = null;

function serverEntry() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "standalone", "server.js")
    : path.join(__dirname, "..", ".next", "standalone", "server.js");
}

// The session secret is made once per PC and kept next to the data.
function sessionSecret(dir) {
  const file = path.join(dir, "session-secret");
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {
    const secret = crypto.randomBytes(32).toString("hex");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, secret);
    return secret;
  }
}

function isFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once("error", () => resolve(false));
    probe.once("listening", () => probe.close(() => resolve(true)));
    probe.listen(port, "127.0.0.1");
  });
}

async function pickPort() {
  if (await isFree(PREFERRED_PORT)) return PREFERRED_PORT;
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function waitForServer(port, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get({ host: "127.0.0.1", port, path: "/", timeout: 2000 }, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", retry);
      req.on("timeout", () => req.destroy());
    };
    const retry = () => {
      if (Date.now() > deadline) reject(new Error("The app server did not start in time."));
      else setTimeout(attempt, 400);
    };
    attempt();
  });
}

async function startServer() {
  const dataDir = path.join(app.getPath("userData"), "data");
  const port = await pickPort();
  serverProcess = spawn(process.execPath, [serverEntry()], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
      CRM_DATA_FILE: path.join(dataDir, "crm.json"),
      SESSION_SECRET: sessionSecret(app.getPath("userData")),
    },
    stdio: "ignore",
    windowsHide: true,
  });
  serverProcess.on("exit", (code) => {
    serverProcess = null;
    if (code && mainWindow) {
      dialog.showErrorBox("Agent CRM stopped", `The app server exited unexpectedly (code ${code}).`);
      app.quit();
    }
  });
  await waitForServer(port);
  return port;
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 760,
    minHeight: 560,
    title: "Agent CRM",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  const origin = `http://127.0.0.1:${port}`;
  // WhatsApp and other outside links open in the normal browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(origin)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.loadURL(origin);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      createWindow(await startServer());
    } catch (err) {
      dialog.showErrorBox("Agent CRM couldn't start", String(err.message || err));
      app.quit();
    }
  });

  app.on("window-all-closed", () => app.quit());
  app.on("before-quit", () => {
    if (serverProcess) serverProcess.kill();
  });
}
