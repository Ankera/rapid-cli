const pkg = require('../package.json');
const utils = require('@rapid-cli/utils');
const log = require('@rapid-cli/log');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const semver = require('semver');
const colors = require('colors');
const constant = require('./const');

function core() {
  try {
    checkPkgVersion();
  
    checkNodeVersion();

    checkRoot();

    checkUserHome();
  } catch (error) {
    log.error(error.message)
  }
}

function checkPkgVersion() {
  log.version(pkg.version)
}

function checkNodeVersion() {
  const currentVersion = process.version;
  
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION;

  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`Rapid-CLI 需要安装 v${lowestNodeVersion} 以上版本的Node.JS`))
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
  const rootCheck = require('root-check');
  rootCheck();
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('用户主目录不存在'));
  }
}

module.exports = core;