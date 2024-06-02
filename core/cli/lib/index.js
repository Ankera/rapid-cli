const path = require("path");
const utils = require("@rapid-cli/utils");
const log = require("@rapid-cli/log");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const semver = require("semver");
const colors = require("colors");
const pkg = require("../package.json");
const constant = require("./const");

let args = null;
let config = null;

function core() {
  try {
    checkPkgVersion();

    checkNodeVersion();

    checkRoot();

    checkUserHome();

    checkInputArgs();

    checkEnv();
    // log.verbose("debug", "test debug log");
  } catch (error) {
    log.error(error.message);
  }
}

function checkPkgVersion() {
  log.version(pkg.version);
}

function checkNodeVersion() {
  const currentVersion = process.version;

  const lowestNodeVersion = constant.LOWEST_NODE_VERSION;

  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(
      colors.red(`Rapid-CLI 需要安装 v${lowestNodeVersion} 以上版本的Node.JS`)
    );
  }
}

/**
 * sudo rp 启动的命令 process.geteuid() 就是 0
 * rp 启动的命令 process.geteuid() 普通用户 就是 501
 *
 * process.setegid()
 * process.seteuid()
 */
function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("用户主目录不存在"));
  }
}

function checkInputArgs() {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs();
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }

  log.level = process.env.LOG_LEVEL;
}

function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: path.resolve(userHome, ".env"),
    });
  } else {
    config = createDefaultConfig();
  }

  log.verbose("环境变量", config);
}

function createDefaultConfig() {
  const cliConifg = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConifg.cliHome = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConifg.cliHome = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }

  process.env.CLI_HOME_PATH = cliConifg.cliHome;
  return cliConifg;
}

module.exports = core;
