const path = require("path");
// const utils = require("@rapid-cli/utils");
const log = require("@rapid-cli/log");
const exec = require("@rapid-cli/exec");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const semver = require("semver");
const colors = require("colors");
const commander = require("commander");
const pkg = require("../package.json");
const C = require("./const");

const program = new commander.Command();

async function core() {
  try {
    await prepare();

    registerCommand();
  } catch (error) {
    log.error(error.message);
  }
}

async function prepare() {
  checkPkgVersion();

  checkNodeVersion();

  checkRoot();

  checkUserHome();

  checkEnv();

  await checkGloalUpdate();
}

function checkPkgVersion() {
  log.version(pkg.version);
}

function checkNodeVersion() {
  const currentVersion = process.version;

  const lowestNodeVersion = C.LOWEST_NODE_VERSION;

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

function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  let config = null;
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: path.resolve(userHome, ".env"),
    });
  } else {
    config = createDefaultConfig();
  }
}

function createDefaultConfig() {
  const cliConifg = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConifg.cliHome = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConifg.cliHome = path.join(userHome, C.DEFAULT_CLI_HOME);
  }

  process.env.CLI_HOME_PATH = cliConifg.cliHome;
  return cliConifg;
}

/**
 * 检查是否要进行全局更新
 */
async function checkGloalUpdate() {
  const { getNpmSemverVersions } = require("@rapid-cli/get-npm-info");

  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;

  // 2. 调用 npm API 获取所有版本号
  // const lastVersion = await getNpmSemverVersions('1.0.4', '@imooc-cli/core');
  const lastVersion = await getNpmSemverVersions(currentVersion, npmName);

  // 3. 提取所有版本号，比对哪些版本号大于当前版本号
  // 4. 获取最新版本号，提示用户更新到改版本
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "更新提示",
      colors.yellow(
        `请手动更新 ${npmName}，当前版本${currentVersion}，最新版本${lastVersion}，更新命令：npm install -g ${npmName}`
      )
    );
  }
}

/**
 * 注册命令
 */
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启debug模式", false)
    .option("-n, --number <numbers...>", "specify numbers")
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化", false)
    .action(exec);

  program.on("option:debug", () => {
    const params = program.opts();
    if (params.debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
  });

  /**
   * 指定全局的 targetPath 监听
   * 执行业务逻辑之前执行
   */
  program.on("option:targetPath", () => {
    const params = program.opts();
    process.env.CLI_TARGET_PATH = params.targetPath;
  });

  /**
   * 对未知命令的监听
   */
  program.on("command:*", (obj) => {
    const availableCommands = program.commands.map((cmd) => cmd.name());

    console.log(colors.red(`未知的命令: ` + obj[0]));

    if (availableCommands.length > 0) {
      console.log(colors.red(`可用的命令结合: ` + availableCommands.join("|")));
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

module.exports = core;
