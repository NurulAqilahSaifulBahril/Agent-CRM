// electron-builder never copies node_modules folders into extraResources, so put
// the server's dependencies into the packaged app by hand.
const fs = require("node:fs");
const path = require("node:path");

exports.default = async function afterPack(context) {
  const from = path.join(context.packager.projectDir, ".next", "standalone", "node_modules");
  const to = path.join(context.appOutDir, "resources", "standalone", "node_modules");
  fs.cpSync(from, to, { recursive: true });
};
