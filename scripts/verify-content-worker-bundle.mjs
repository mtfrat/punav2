import fs from "node:fs";
import path from "node:path";

const root = path.resolve("build/client");
const forbidden = [
  "AUTOPOST_WORKER_TOKEN",
  "VITE_AUTOPOST_WORKER_TOKEN",
  "NEXT_PUBLIC_AUTOPOST_WORKER_TOKEN",
  "PEXELS_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "VITE_PEXELS_API_KEY",
  "NEXT_PUBLIC_PEXELS_API_KEY",
  "VITE_CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "VITE_CLOUDINARY_API_KEY",
  "NEXT_PUBLIC_CLOUDINARY_API_KEY",
  "VITE_CLOUDINARY_API_SECRET",
  "NEXT_PUBLIC_CLOUDINARY_API_SECRET",
  process.env.AUTOPOST_WORKER_TOKEN,
  process.env.PEXELS_API_KEY,
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
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
