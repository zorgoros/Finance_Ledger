import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
  clearTransactions,
  createTransaction,
  dbPath,
  deleteTransaction,
  getSetting,
  getTransactions,
  replaceTransactions,
  setSetting,
  updateTransaction,
} from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..", "web");
const port = Number(process.env.PORT || 8080);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function sendError(response, status, message) {
  sendJson(response, status, { error: message });
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function getRoute(request) {
  return new URL(request.url, `http://${request.headers.host}`);
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/transactions") {
    sendJson(response, 200, { transactions: getTransactions() });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/transactions") {
    const body = await readJson(request);
    sendJson(response, 201, { transaction: createTransaction(body.transaction, body.audit) });
    return;
  }

  const transactionMatch = /^\/api\/transactions\/([^/]+)$/.exec(url.pathname);
  if (transactionMatch && request.method === "PUT") {
    const body = await readJson(request);
    sendJson(response, 200, { transaction: updateTransaction(decodeURIComponent(transactionMatch[1]), body.transaction, body.audit) });
    return;
  }

  if (transactionMatch && request.method === "DELETE") {
    const body = await readJson(request);
    sendJson(response, 200, { deleted: deleteTransaction(decodeURIComponent(transactionMatch[1]), body.audit) });
    return;
  }

  if (request.method === "DELETE" && url.pathname === "/api/transactions") {
    const body = await readJson(request);
    sendJson(response, 200, clearTransactions(body.audit));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/import") {
    const body = await readJson(request);
    sendJson(response, 200, { transactions: replaceTransactions(body.transactions || [], body.audit) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/export") {
    sendJson(response, 200, { transactions: getTransactions() });
    return;
  }

  const settingMatch = /^\/api\/settings\/([^/]+)$/.exec(url.pathname);
  if (settingMatch && request.method === "GET") {
    sendJson(response, 200, { value: getSetting(decodeURIComponent(settingMatch[1])) });
    return;
  }

  if (settingMatch && request.method === "PUT") {
    const body = await readJson(request);
    setSetting(decodeURIComponent(settingMatch[1]), body.value || "");
    sendJson(response, 200, { value: body.value || "" });
    return;
  }

  sendError(response, 404, "API endpoint not found.");
}

function serveStatic(request, response, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const blockedPath = ["/.git", "/local-data", "/node_modules", "/apps/api"].some(
    (prefix) => requestedPath === prefix || requestedPath.startsWith(`${prefix}/`),
  );
  if (blockedPath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const filePath = normalize(join(rootDir, requestedPath));

  if (!filePath.startsWith(rootDir) || !existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  const url = getRoute(request);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    serveStatic(request, response, url);
  } catch (error) {
    sendError(response, 500, error.message || "Server error.");
  }
});

server.listen(port, () => {
  console.log(`Money Ledger running at http://localhost:${port}`);
  console.log(`SQLite database: ${dbPath}`);
});
