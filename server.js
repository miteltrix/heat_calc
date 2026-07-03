const http = require("http");
const fs = require("fs");
const path = require("path");

const publicDir = __dirname;
const port = Number(process.env.PORT || 8090);
const host = process.env.HOST || "0.0.0.0";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": status === 200 ? "public, max-age=60" : "no-store"
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const cleanPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const relativePath = cleanPath === "" ? "index.html" : cleanPath;
  const filePath = path.normalize(path.join(publicDir, relativePath));

  if (!filePath.startsWith(publicDir)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      send(res, 404, "Not found");
      return;
    }
    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        send(res, 500, "Server error");
        return;
      }
      send(res, 200, data, types[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    });
  });
});

server.listen(port, host, () => {
  console.log(`Heat Exchange Calculator running at http://${host}:${port}`);
});
