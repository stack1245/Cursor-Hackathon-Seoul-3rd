import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const nextDir = resolve(process.cwd(), ".next");

try {
  await rm(nextDir, { recursive: true, force: true });
} catch {
  // Ignore cleanup failures and continue dev startup.
}
