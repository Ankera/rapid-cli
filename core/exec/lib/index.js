"use strict";

const path = require("path");
const Package = require("@rapid-cli/package");
const log = require("@rapid-cli/log");

const SETTINGS = {
  // init: "@rapid-cli/init",
  // init: "@imooc-cli/init",
  init: "@rapid-cli/utils"
};

const CACHE_DIR = "dependencies";

async function exec() {
  // TODO
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = "";
  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);

  let pkg = null;
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
    /**
     * rp init test-project --debug --force
     */
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    log.verbose("targetPath =>", targetPath);
    log.verbose("storeDir =>", storeDir);
    pkg = new Package({
      targetPath,
      packageName,
      storeDir,
      packageVersion,
    });
    if (await pkg.exists()) {
      await pkg.update();
    } else {
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }

  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    log.verbose('rootFile', rootFile);
    require(rootFile).apply(null, arguments)
  }
}

module.exports = exec;
