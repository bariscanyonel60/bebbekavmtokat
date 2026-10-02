// Dev-only QA helper: decodes a CDP Page.captureScreenshot JSON dump and splits it into readable tiles.
// Usage: node scripts/split-shot.mjs <cdp-json> <name> [tileHeight]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [, , input, name = "shot", tileArg = "1100"] = process.argv;
const outDir = path.join(".local", "shots");
fs.mkdirSync(outDir, { recursive: true });

const json = JSON.parse(fs.readFileSync(input, "utf8"));
const data = json.data ?? json.result?.data;
const full = path.join(outDir, `${name}-full.jpg`);
fs.writeFileSync(full, Buffer.from(data, "base64"));

const info = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", full], { encoding: "utf8" });
const width = Number(info.match(/pixelWidth: (\d+)/)[1]);
const height = Number(info.match(/pixelHeight: (\d+)/)[1]);
const tile = Number(tileArg);

for (let y = 0, i = 1; y < height; y += tile, i += 1) {
  const h = Math.min(tile, height - y);
  const out = path.join(outDir, `${name}-${i}.jpg`);
  execFileSync("sips", ["-c", String(h), String(width), "--cropOffset", String(y), "0", full, "--out", out], { stdio: "ignore" });
  console.log(out);
}
