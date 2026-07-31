import "dotenv/config";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createDatabase } from "./database.js";

const filename = resolve(
  process.cwd(),
  process.env.DATABASE_FILE || "./data/inventory.db"
);

if (existsSync(filename)) rmSync(filename);
if (existsSync(`${filename}-shm`)) rmSync(`${filename}-shm`);
if (existsSync(`${filename}-wal`)) rmSync(`${filename}-wal`);

const db = createDatabase(filename);
db.close();
console.log("Demo database reset.");
