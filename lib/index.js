"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var chokidar_1 = __importDefault(require("chokidar"));
var core_1 = require("@swc/core");
var glob_1 = __importDefault(require("glob"));
var cwd = process.cwd();
var watcher = chokidar_1.default.watch("mock", {
    cwd: cwd,
    persistent: true,
});
function buildMockModule() {
    return new Promise(function (resolve) {
        (0, glob_1.default)("mock/*.ts", function (_, files) {
            files.forEach(function (file) {
                var _a;
                var code = (0, core_1.transformFileSync)("".concat(cwd, "/").concat(file), {
                    jsc: {
                        target: "es5",
                        parser: {
                            syntax: "typescript",
                        },
                    },
                    module: {
                        type: "commonjs",
                    },
                }).code;
                var outputDir = "".concat(cwd, "/.mock");
                if (!fs_1.default.existsSync(outputDir)) {
                    fs_1.default.mkdirSync(outputDir);
                }
                fs_1.default.writeFileSync("".concat(outputDir, "/").concat((_a = file.match(/mock\/(.*).ts/)) === null || _a === void 0 ? void 0 : _a[1], ".js"), code, "utf8");
            });
            resolve();
        });
    });
}
var childProcess;
var pending;
function startServer() {
    pending = buildMockModule().then(function () {
        childProcess = (0, child_process_1.spawn)("node", ["".concat(__dirname, "/server.js")], {
            stdio: "inherit",
        });
    });
}
startServer();
watcher.on("all", function () {
    pending.then(function () {
        childProcess.kill();
        startServer();
    });
});
