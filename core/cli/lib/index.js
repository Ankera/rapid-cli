const pkg = require('../package.json');
const utils = require('@rapid-cli/utils');
const log = require('@rapid-cli/log');

function core() {
  checkPkgVeresion();
}

function checkPkgVeresion() {
  console.log(pkg.version)

  log.success('test', 'success....')
}

module.exports = core;