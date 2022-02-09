import { ChildProcess, spawn } from "child_process";
import fs from "fs-extra";
import chokidar from "chokidar";
import { transformFileSync } from "@swc/core";
import glob from "glob";

interface MockServerOption {
  root: string;
}

function creatMockServer(option: MockServerOption) {
  const { root } = option;
  const cwd = process.cwd();

  const watcher = chokidar.watch(root, {
    cwd,
    persistent: true,
  });

  function buildMockModule() {
    return new Promise<void>((resolve) => {
      glob(`${root}/**/*.{js,ts}`, function (_, files) {
        files.forEach((file) => {
          const { code } = transformFileSync(`${cwd}/${file}`, {
            jsc: {
              target: "es5",
              parser: {
                syntax: file.endsWith("ts") ? "typescript" : "ecmascript",
              },
            },
            module: {
              type: "commonjs",
            },
          });
          const filePath = `${cwd}/.mock/${file.match(/[^/]+\/(.*)\.[tj]s/)?.[1]}.js`
          fs.ensureFileSync(filePath)
          fs.writeFileSync(filePath, code, "utf8");
        });
        resolve();
      });
    });
  }

  let childProcess: ChildProcess;
  let pending: Promise<void> = new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 1000)
  });

  function startServer() {
    return buildMockModule().then(() => {
      childProcess = spawn("node", [`${__dirname}/server.js`], {
        stdio: "inherit",
      });
    });
  }

  watcher.on("all", () => {
    pending = pending.then(() => {
      childProcess?.kill();
      return startServer();
    });
  });
}

export default creatMockServer;
