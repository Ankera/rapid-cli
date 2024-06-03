'use strict';

const Package = require('@rapid-cli/package');
const log = require("@rapid-cli/log");

const SETTINGS = {
    // init: "@rapid-cli/utils",
    init: "@imooc-cli/init",
  }

function exec() {
    // TODO
    const targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', targetPath)
    log.verbose('homePath', homePath)

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';

    if (!targetPath) {

    } else {

    }
    const pkg = new Package({
        targetPath,
        packageName,
        packageVersion
    });

    console.log(112233, pkg.getRootFilePath())
}

module.exports = exec;
