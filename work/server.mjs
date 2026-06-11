import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root = process.cwd();
createServer(async (req, res) => {
  try {
    const path = req.url === "/" ? "index.html" : req.url.slice(1);
    const body = await readFile(join(root, path));
    res.setHeader("Content-Type", extname(path) === ".html" ? "text/html; charset=utf-8" : "text/plain");
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
}).listen(4173, "127.0.0.1");
