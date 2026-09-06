import fs from "node:fs";
import path from "node:path";

const root = path.resolve("build/client");
const forbidden = [
  "AUTOPOST_WORKER_TOKEN",
  "VITE_AUTOPOST_WORKER_TOKEN",
  "NEXT_PUBLIC_AUTOPOST_WORKER_TOKEN",
  process.env.AUTOPOST_WORKER_TOKEN,
].filter(Boolean);

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? files(target) : [target];
  });
}

for (const file of files(root)) {
  const content = fs.readFileSync(file);
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  for (const value of forbidden) {
    if (text.includes(value)) throw new Error(`Private worker configuration leaked into ${file}`);
  }
}
console.log("Content worker secrets are absent from the client bundle.");
