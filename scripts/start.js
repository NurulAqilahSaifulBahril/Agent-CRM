const { spawn } = require("child_process");
const path = require("path");

process.env.HOSTNAME = "0.0.0.0";
process.env.PORT = process.env.PORT || "3000";

const server = path.join(__dirname, "..", ".next", "standalone", "server.js");
const child = spawn(process.execPath, [server], { stdio: "inherit", env: process.env });

child.on("exit", (code) => process.exit(code ?? 1));
