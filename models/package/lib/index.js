"use strict";

const pkgDir = require('pkg-dir').sync;
const { isObject } = require("@rapid-cli/utils");

class Package {
  constructor(options) {
    if (!options || !isObject(options)) {
      throw new Error("Package 类的options不能为空！");
    }
    // package 的路径
    this.targetPath = options.targetPath;

    // package 的存储路径
    // this.storeDir = options.storeDir;

    // package 的 name
    this.packageName = options.packageName;

    // package 的版本号
    this.packageVersion = options.packageVersion;
  }

  async install() {}

  async update() {}

  getRootFilePath() {
    /**
     * rp init --targetPath /Users/yuyayong/Documents/github/rapid/rapid-cli/commands/init --debug test-project --force
     */
    const dir = pkgDir(this.targetPath);
  }
}

module.exports = Package;
