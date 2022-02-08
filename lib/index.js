"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var chokidar_1 = __importDefault(require("chokidar"));
var watcher = chokidar_1.default.watch("mock", {
    cwd: process.cwd(),
    persistent: true,
});
var childProcess;
function startServer() {
    childProcess = (0, child_process_1.spawn)("node", ["--loader", "ts-node/esm", "server.js"], {
        stdio: "inherit",
    });
}
startServer();
watcher.on("all", function () {
    if (!childProcess.killed) {
        childProcess.kill();
    }
    startServer();
});
