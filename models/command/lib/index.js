"use strict";

const log = require("@rapid-cli/log");
const semver = require("semver");
const colors = require("colors");

const LOWEST_NODE_VERSION = "12.0.0";

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error("参数不能为空");
    }

    if (!Array.isArray(argv)) {
      throw new Error("参数必须为数组");
    }

    if (argv.length < 1) {
      throw new Error("参数不能为空");
    }

    this._argv = argv;

    const runner = new Promise((resolve, reject) => {
        let chain = Promise.resolve();
        chain = chain.then(() => { this.checkNodeVersion() });
        chain = chain.then(() => { this.initArgs() });
        chain = chain.then(() => { this.init() });
        chain = chain.then(() => { this.exec() });
        
        chain.catch((err) => {
            log.error('runner', err.message);
        })
    })
  }

  init () {
    throw new Error('init必须实现')
  }

  exec () {
    throw new Error('exec必须实现')
  }

  checkNodeVersion() {
    const currentVersion = process.version;
  
    const lowestNodeVersion = LOWEST_NODE_VERSION;

    if (!semver.gte(currentVersion, lowestNodeVersion)) {
      throw new Error(
        colors.red(`Rapid-CLI 需要安装 v${lowestNodeVersion} 以上版本的Node.JS`)
      );
    }
  }

  initArgs () {
    this._argv = this._argv.slice(0, this._argv.length - 1);
    
    // this._cmd = this._argv[this._argv.length - 1];
    this._cmd = {
      ...this._argv[1],
      ...this._argv[2]
    }
  }
}

module.exports = Command;
