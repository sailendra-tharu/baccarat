import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(SCRIPT_DIR, "license-registry.json");

if (!existsSync(REGISTRY_PATH)) {
  console.log("Total licenses created from this project: 0");
  process.exit(0);
}

let registry = [];
try {
  registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
} catch {
  console.error(`Could not read ${REGISTRY_PATH}`);
  process.exit(1);
}

if (!Array.isArray(registry)) {
  console.error(`${REGISTRY_PATH} is not a valid license registry.`);
  process.exit(1);
}

console.log(`Total licenses created from this project: ${registry.length}`);

for (const [index, license] of registry.entries()) {
  console.log(
    `${index + 1}. ${license.key} | ${license.target_path} | ${license.created_at}`,
  );
}
