"use strict";

const path = require("path");
const Package = require("@rapid-cli/package");
const log = require("@rapid-cli/log");
const UTILS = require('@rapid-cli/utils');

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
    try {
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);

      Object.keys(cmd).forEach(key => {
        if (cmd.hasOwnProperty(key) &&
          !key.startsWith('_') &&
          key !== 'parent') {
          o[key] = cmd[key];
        }
      })

      args[args.length - 1] = o;
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;

      const child = UTILS.exec('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });

      child.on('error', error => {
        log.error('child', error.message);
        process.exit(1)
      });

      child.on('exit', e => {
        if (e) {
          log.verbose('命令执行成功', e.toString());
        }
        process.exit(e);
      });

    } catch (error) {
      log.error('rootFile', error.message);
    }
  }
}

module.exports = exec;
