import { ChildProcess, spawn } from "child_process";
import chokidar from "chokidar";

const watcher = chokidar.watch("mock", {
  cwd: process.cwd(),
  persistent: true,
});

let childProcess: ChildProcess;

function startServer() {
  childProcess = spawn("node", ["--loader", "ts-node/esm", "server.js"], {
    stdio: "inherit",
  });
}

startServer();
watcher.on("all", () => {
  if (!childProcess.killed) {
    childProcess.kill();
  }
  startServer();
});
