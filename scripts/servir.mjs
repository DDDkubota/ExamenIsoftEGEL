#!/usr/bin/env node
// Servidor estático mínimo para usar la app localmente (sin dependencias).
// Uso: node scripts/servir.mjs [puerto]  →  http://localhost:8080/app/
import { createServer } from "node:http";
import { createReadStream, statSync, existsSync } from "node:fs";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = Number(process.argv[2] ?? process.env.PORT ?? 8080);
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".doc": "application/msword", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function resolver(urlPath) {
  const limpio = decodeURIComponent(urlPath.split("?")[0]);
  // Los nombres pueden estar en NFC o NFD en disco.
  for (const forma of [limpio, limpio.normalize("NFC"), limpio.normalize("NFD")]) {
    const ruta = normalize(join(RAIZ, forma));
    if (!ruta.startsWith(RAIZ)) return null; // evita ../
    if (existsSync(ruta)) {
      const st = statSync(ruta);
      if (st.isDirectory()) {
        const idx = join(ruta, "index.html");
        if (existsSync(idx)) return idx;
        continue;
      }
      return ruta;
    }
  }
  return null;
}

createServer((req, res) => {
  if (req.url === "/" || req.url === "") {
    res.writeHead(302, { Location: "/app/" });
    return res.end();
  }
  const ruta = resolver(req.url);
  if (!ruta) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("No encontrado");
  }
  res.writeHead(200, { "Content-Type": TIPOS[extname(ruta).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "no-cache" });
  createReadStream(ruta).pipe(res);
}).listen(PUERTO, () => console.log(`Simulador EGEL listo en http://localhost:${PUERTO}/app/`));
