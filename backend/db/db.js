import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, "vault.sqlite");
const schemaFile = path.join(__dirname, "schema.sql");

export const db = new Database(dbFile);

const schema = fs.readFileSync(schemaFile, "utf-8");
db.exec(schema);
