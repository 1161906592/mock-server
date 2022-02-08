import { ChildProcess, spawn } from "child_process";
import fs from "fs";
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
        const { code } = transformFileSync(`${cwd}/${file}`, {
          jsc: {
            target: "es5",
            parser: {
              syntax: "typescript",
            },
          },
          module: {
            type: "commonjs",
          },
        });
        const outputDir = `${cwd}/.mock`;
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir);
        }
        fs.writeFileSync(`${outputDir}/${file.match(/mock\/(.*).ts/)?.[1]}.js`, code, "utf8");
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
  if (childProcess && !childProcess.killed) {
    childProcess.kill();
  }
  startServer();
});
