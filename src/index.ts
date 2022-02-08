import { ChildProcess, spawn } from "child_process";
import chokidar from "chokidar";
import { transformFileSync } from "@swc/core";
import glob from "glob";

const cwd = process.cwd();

const watcher = chokidar.watch("mock", {
  cwd,
  persistent: true,
});

function buildMockModule() {
  return new Promise<void>((resolve) => {
    glob("mock/*.ts", function (_, files) {
      files.forEach((file) => {
        transformFileSync(`${cwd}/${file}`, {
          jsc: {
            target: "es5",
            parser: {
              syntax: "typescript",
            },
          },
          module: {
            type: "commonjs",
          },
          outputPath: `${cwd}.mock/${file.match(/mock\/(.*).ts/)?.[1]}.js`,
        });
      });
      resolve();
    });
  });
}

let childProcess: ChildProcess;

async function startServer() {
  await buildMockModule();
  childProcess = spawn("node", [`${__dirname}/server.js`], {
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
