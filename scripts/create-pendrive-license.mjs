import { chmodSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const LICENSE_FILE_NAME = "baccarat-license.json";
const LICENSE_PRODUCT = "baccarat-desktop";
const LICENSE_SIGNING_SECRET = "baccarat-license-v1-5f7c1f2e6d9a4b8c91e3a702d14f0c65";

function fnv1a64(input) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;

  for (const byte of Buffer.from(input)) {
    hash ^= BigInt(byte);
    hash = (hash * prime) & mask;
  }

  return hash.toString(16).padStart(16, "0");
}

function licenseSignature(key) {
  return fnv1a64(
    `${LICENSE_PRODUCT}|license|${key.trim()}|${LICENSE_SIGNING_SECRET}`,
  );
}

const [, , key, targetDir] = process.argv;

if (!key || !targetDir) {
  console.error("Usage: node scripts/create-pendrive-license.mjs <secret-key> <pendrive-path>");
  console.error("Example Windows: node scripts/create-pendrive-license.mjs ABC-123 E:\\");
  console.error("Example Linux:   node scripts/create-pendrive-license.mjs ABC-123 /media/user/USB");
  process.exit(1);
}

const license = {
  product: LICENSE_PRODUCT,
  key,
  license_signature: licenseSignature(key),
  bound_machine: null,
  binding_signature: null,
};

const outputPath = join(targetDir, LICENSE_FILE_NAME);
if (process.platform === "win32") {
  try {
    execFileSync("attrib", ["-r", "-h", outputPath], { windowsHide: true });
  } catch {
    // File may not exist yet.
  }
} else {
  try {
    chmodSync(outputPath, 0o666);
  } catch {
    // File may not exist yet.
  }
}

writeFileSync(outputPath, `${JSON.stringify(license, null, 2)}\n`);
chmodSync(outputPath, 0o444);
if (process.platform === "win32") {
  execFileSync("attrib", ["+r", outputPath], { windowsHide: true });
  execFileSync("attrib", ["+h", outputPath], { windowsHide: true });
}
console.log(`Created ${outputPath}`);
