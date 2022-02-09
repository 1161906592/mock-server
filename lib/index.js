"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fs_extra_1 = __importDefault(require("fs-extra"));
var chokidar_1 = __importDefault(require("chokidar"));
var core_1 = require("@swc/core");
var glob_1 = __importDefault(require("glob"));
function creatMockServer(option) {
    var root = option.root;
    var cwd = process.cwd();
    var watcher = chokidar_1.default.watch(root, {
        cwd: cwd,
        persistent: true,
    });
    function buildMockModule() {
        return new Promise(function (resolve) {
            (0, glob_1.default)("".concat(root, "/**/*.{js,ts}"), function (_, files) {
                files.forEach(function (file) {
                    var _a;
                    var code = (0, core_1.transformFileSync)("".concat(cwd, "/").concat(file), {
                        jsc: {
                            target: "es5",
                            parser: {
                                syntax: file.endsWith("ts") ? "typescript" : "ecmascript",
                            },
                        },
                        module: {
                            type: "commonjs",
                        },
                    }).code;
                    var filePath = "".concat(cwd, "/.mock/").concat((_a = file.match(/[^/]+\/(.*)\.[tj]s/)) === null || _a === void 0 ? void 0 : _a[1], ".js");
                    fs_extra_1.default.ensureFileSync(filePath);
                    fs_extra_1.default.writeFileSync(filePath, code, "utf8");
                });
                resolve();
            });
        });
    }
    var childProcess;
    var pending = new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 1000);
    });
    function startServer() {
        return buildMockModule().then(function () {
            childProcess = (0, child_process_1.spawn)("node", ["".concat(__dirname, "/server.js")], {
                stdio: "inherit",
            });
        });
    }
    watcher.on("all", function () {
        pending = pending.then(function () {
            childProcess === null || childProcess === void 0 ? void 0 : childProcess.kill();
            return startServer();
        });
    });
}
exports.default = creatMockServer;
