const fs = require("fs");
const path = require("path");

const standaloneDir = path.join(".next", "standalone");
if (!fs.existsSync(standaloneDir)) {
  process.exit(0);
}

fs.cpSync("public", path.join(standaloneDir, "public"), { recursive: true });
fs.cpSync(path.join(".next", "static"), path.join(standaloneDir, ".next", "static"), {
  recursive: true,
});
