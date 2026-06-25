import { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const dataDir = join(rootDir, "local-data");
const pidPath = join(dataDir, "money-ledger.pid");
const logPath = join(dataDir, "money-ledger-launch.log");
const appUrl = "http://127.0.0.1:8080/";

mkdirSync(dataDir, { recursive: true });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readPid() {
  if (!existsSync(pidPath)) return 0;
  const value = Number(readFileSync(pidPath, "utf8").trim());
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function isServerReady(timeoutMs = 1000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${appUrl}api/transactions`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function openBrowser() {
  if (process.env.MONEY_LEDGER_NO_BROWSER === "1") return;

  if (process.platform === "darwin") {
    const child = spawn("open", [appUrl], { detached: true, stdio: "ignore" });
    child.unref();
    return;
  }

  if (process.platform === "win32") {
    const child = spawn("cmd", ["/c", "start", "", appUrl], { detached: true, stdio: "ignore", windowsHide: true });
    child.unref();
    return;
  }

  const child = spawn("xdg-open", [appUrl], { detached: true, stdio: "ignore" });
  child.unref();
}

function startServer() {
  const logFd = openSync(logPath, "w");
  const child = spawn(process.execPath, ["apps/api/index.js"], {
    cwd: rootDir,
    detached: true,
    env: process.env,
    stdio: ["ignore", logFd, logFd],
  });

  child.unref();
  closeSync(logFd);
  writeFileSync(pidPath, String(child.pid), "utf8");
  return child.pid;
}

async function waitForServer(timeoutMs = 20_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerReady()) return;
    await delay(200);
  }

  throw new Error(`Money Ledger did not start. Check ${logPath} for details.`);
}

async function main() {
  const currentPid = readPid();
  if (await isServerReady()) {
    openBrowser();
    console.log(`Money Ledger is already running at ${appUrl}`);
    return;
  }

  if (currentPid && !isPidAlive(currentPid)) {
    rmSync(pidPath, { force: true });
  }

  if (!currentPid || !isPidAlive(currentPid)) {
    startServer();
  }

  await waitForServer();
  openBrowser();
  console.log(`Money Ledger opened at ${appUrl}`);
  console.log('Use "Stop Money Ledger.command" or `npm run stop` to end the session.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
