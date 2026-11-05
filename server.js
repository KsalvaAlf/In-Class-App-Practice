const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "event-log.csv");

fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, "Timestamp,Character,Press count,Animation name,Result\n", "utf8");
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(value));
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function appendEvent(body) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const timestamp = new Date().toISOString();
  const row = [
    timestamp,
    csvCell(body.character),
    body.pressCount,
    csvCell(body.animation),
    csvCell(body.result)
  ].join(",") + "\n";
  await fs.promises.appendFile(LOG_FILE, row, "utf8");
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/events") {
    try {
      let raw = "";
      request.setEncoding("utf8");
      for await (const chunk of request) raw += chunk;
      const body = JSON.parse(raw || "{}");
      if (!Number.isInteger(body.pressCount) || typeof body.animation !== "string" || typeof body.result !== "string") {
        sendJson(response, 400, { error: "Invalid event data" });
        return;
      }
      await appendEvent(body);
      sendJson(response, 201, { ok: true });
    } catch (error) {
      sendJson(response, 500, { error: "Could not append the event log" });
    }
    return;
  }

  let relativePath = url.pathname === "/" ? "/index.html" : url.pathname;
  relativePath = decodeURIComponent(relativePath).replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, relativePath);
  if (!filePath.startsWith(path.resolve(PUBLIC_DIR) + path.sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500).end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }
    const extension = path.extname(filePath).toLowerCase();
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8"
    };
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Character Explosion is running at http://localhost:${PORT}`);
});
