/**
 * Lightweight JSON file API (no database).
 * Persists mutable demo state to data/store.json
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const PORT = Number(process.env.CA_JSON_PORT || 5174);

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, data) {
  const body = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function readStore() {
  if (!fs.existsSync(STORE_PATH)) return null;
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
}

function writeStore(data) {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(STORE_PATH, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (req.method === "OPTIONS") {
    return send(res, 204, "");
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, { ok: true, store: STORE_PATH, exists: fs.existsSync(STORE_PATH) });
    }

    if (req.method === "GET" && url.pathname === "/api/store") {
      const store = readStore();
      if (!store) return send(res, 404, { error: "Store not initialized" });
      return send(res, 200, store);
    }

    if (req.method === "PUT" && url.pathname === "/api/store") {
      const body = await readBody(req);
      if (!body || typeof body !== "object") {
        return send(res, 400, { error: "Invalid JSON body" });
      }
      const saved = writeStore(body);
      return send(res, 200, saved);
    }

    if (req.method === "DELETE" && url.pathname === "/api/store") {
      if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
      return send(res, 200, { ok: true, reset: true });
    }

    send(res, 404, { error: "Not found" });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: String(err?.message || err) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[ca-json] JSON store API on http://127.0.0.1:${PORT}`);
  console.log(`[ca-json] File: ${STORE_PATH}`);
});
