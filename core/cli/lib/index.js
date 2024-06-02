const pkg = require('../package.json');
const utils = require('@rapid-cli/utils');
const log = require('@rapid-cli/log');
const semver = require('semver');
const colors = require('colors');
const constant = require('./const');

function core() {
  try {
    checkPkgVersion();
  
    checkNodeVersion();
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

module.exports = core;