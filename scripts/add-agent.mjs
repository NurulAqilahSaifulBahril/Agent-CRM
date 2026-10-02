// Add an agent who can sign in with their phone number:
//
//   node scripts/add-agent.mjs "Aisyah Rahman" "012-345 6789"

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [name, phone] = process.argv.slice(2);
if (!name || !phone) {
  console.error('Usage: node scripts/add-agent.mjs "<name>" "<phone>"');
  process.exit(1);
}

const file = process.env.CRM_DATA_FILE || path.join(process.cwd(), "data", "crm.json");
let data = { agents: [], leads: [] };
try {
  data = JSON.parse(await readFile(file, "utf8"));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

data.agents.push({ id: `agent-${randomUUID()}`, name, phone });
await mkdir(path.dirname(file), { recursive: true });
await writeFile(file, JSON.stringify(data, null, 2));
console.log(`Added ${name}. ${data.agents.length} agent(s) in ${file}`);
