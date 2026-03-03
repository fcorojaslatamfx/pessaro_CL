import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// ----------------------------------------------------
// RUTAS CORREGIDAS
// ----------------------------------------------------

// Antes: src/assets/images.ts  ❌
// Ahora: src/lib/images.ts     ✔
const imagesFile = path.resolve("src/lib/images.ts");

// Directorio público donde viven las imágenes reales
const publicImagesDir = path.resolve("public/images");

// Directorio donde se genera el reporte
const reportDir = path.resolve("reports");
const reportFile = path.join(reportDir, "images-report.html");

// Configuración
const REMOTE_TIMEOUT_MS = 7000;
const REMOTE_RETRIES = 2;
const CONCURRENCY = 10;
const GENERATE_HTML_REPORT = true;

// ----------------------------------------------------
// Utilidades
// ----------------------------------------------------

function logInfo(msg: string) {
  console.log(msg);
}

function logError(msg: string) {
  console.error(msg);
}

// ----------------------------------------------------
// Lectura de imágenes desde images.ts
// ----------------------------------------------------

const fileContent = fs.readFileSync(imagesFile, "utf8");

const localRegex = /"\/images\/([^"]+)"/g;
const remoteRegex = /"(https?:\/\/[^"]+)"/g;

const localPaths: string[] = [];
const remoteUrls: string[] = [];

let match: RegExpExecArray | null;

while ((match = localRegex.exec(fileContent)) !== null) {
  localPaths.push(`/images/${match[1]}`);
}

while ((match = remoteRegex.exec(fileContent)) !== null) {
  const url = match[1];
  if (url.startsWith("http")) {
    remoteUrls.push(url);
  }
}

// ----------------------------------------------------
// Validación de imágenes locales
// ----------------------------------------------------

type LocalResult = {
  path: string;
  exists: boolean;
};

function validateLocalImages(): LocalResult[] {
  const results: LocalResult[] = [];

  for (const relPath of localPaths) {
    const fileName = relPath.replace("/images/", "");
    const fullPath = path.join(publicImagesDir, fileName);
    const exists = fs.existsSync(fullPath);

    results.push({ path: relPath, exists });
  }

  return results;
}

// ----------------------------------------------------
// Validación de imágenes remotas
// ----------------------------------------------------

type RemoteResult = {
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
};

async function checkRemoteOnce(url: string): Promise<RemoteResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal
    });

    clearTimeout(timeout);

    return {
      url,
      ok: res.ok,
      status: res.status
    };
  } catch (err: any) {
    clearTimeout(timeout);
    return {
      url,
      ok: false,
      error: err?.message || "Unknown error"
    };
  }
}

async function checkRemoteWithRetries(url: string): Promise<RemoteResult> {
  let lastResult: RemoteResult = { url, ok: false };

  for (let attempt = 0; attempt <= REMOTE_RETRIES; attempt++) {
    const result = await checkRemoteOnce(url);
    lastResult = result;

    if (result.ok) return result;
  }

  return lastResult;
}

async function validateRemoteImages(): Promise<RemoteResult[]> {
  const results: RemoteResult[] = [];
  const queue = [...remoteUrls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) return;
      const result = await checkRemoteWithRetries(url);
      results.push(result);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  return results;
}

// ----------------------------------------------------
// Reporte HTML
// ----------------------------------------------------

function generateHtmlReport(
  localResults: LocalResult[],
  remoteResults: RemoteResult[]
) {
  if (!GENERATE_HTML_REPORT) return;

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const localRows = localResults
    .map((r) => {
      const status = r.exists ? "OK" : "MISSING";
      const color = r.exists ? "#16a34a" : "#dc2626";
      return `<tr><td>${r.path}</td><td style="color:${color};font-weight:600">${status}</td></tr>`;
    })
    .join("\n");

  const remoteRows = remoteResults
    .map((r) => {
      const status = r.ok ? "OK" : "FAIL";
      const color = r.ok ? "#16a34a" : "#dc2626";
      const detail = r.ok
        ? `HTTP ${r.status}`
        : r.status
        ? `HTTP ${r.status}`
        : r.error || "Error";
      return `<tr><td>${r.url}</td><td style="color:${color};font-weight:600">${status}</td><td>${detail}</td></tr>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de Imágenes - Pessaro</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; background: #0b1120; color: #e5e7eb; }
    h1, h2 { color: #f9fafb; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th, td { border: 1px solid #1f2937; padding: 8px 12px; font-size: 14px; }
    th { background: #111827; text-align: left; }
    tr:nth-child(even) { background: #020617; }
    tr:nth-child(odd) { background: #020617; }
    code { background: #111827; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Reporte de Imágenes - Pessaro</h1>
  <p>Generado: ${new Date().toISOString()}</p>

  <h2>Imágenes locales</h2>
  <table>
    <thead>
      <tr>
        <th>Ruta</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      ${localRows}
    </tbody>
  </table>

  <h2>Imágenes remotas</h2>
  <table>
    <thead>
      <tr>
        <th>URL</th>
        <th>Estado</th>
        <th>Detalle</th>
      </tr>
    </thead>
    <tbody>
      ${remoteRows}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(reportFile, html, "utf8");
  logInfo(`✔ Reporte HTML generado en: ${reportFile}`);
}

// ----------------------------------------------------
// Ejecución principal
// ----------------------------------------------------

(async () => {
  logInfo("▶ Iniciando validación de imágenes...");

  const localResults = validateLocalImages();
  const remoteResults = await validateRemoteImages();

  const missingLocal = localResults.filter((r) => !r.exists);
  const failingRemote = remoteResults.filter((r) => !r.ok);

  generateHtmlReport(localResults, remoteResults);

  if (missingLocal.length > 0 || failingRemote.length > 0) {
    logError("\n❌ ERROR: Validación de imágenes falló.\n");

    if (missingLocal.length > 0) {
      logError("Imágenes LOCALES faltantes:\n");
      missingLocal.forEach((r) => logError(" - " + r.path));
      console.error("");
    }

    if (failingRemote.length > 0) {
      logError("Imágenes REMOTAS inaccesibles:\n");
      failingRemote.forEach((r) => {
        const detail = r.ok
          ? `HTTP ${r.status}`
          : r.status
          ? `HTTP ${r.status}`
          : r.error || "Error";
        logError(` - ${r.url} (${detail})`);
      });
      console.error("");
    }

    logError("Corrige las rutas o reemplaza las imágenes inaccesibles.\n");
    process.exit(1);
  }

  logInfo("✔ Validación completa: todas las imágenes locales y remotas son válidas.");
})();
