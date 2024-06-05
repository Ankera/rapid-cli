"use strict";

const path = require("path");
const npminstall = require("npminstall");
const pathExists = require("path-exists").sync;
const pkgDir = require("pkg-dir").sync;
const { isObject } = require("@rapid-cli/utils");
const formatPath = require("@rapid-cli/format-path");
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require("@rapid-cli/get-npm-info");
const fse = require("fs-extra");

class Package {
  constructor(options) {
    if (!options || !isObject(options)) {
      throw new Error("Package 类的options不能为空！");
    }
    // package 的路径
    this.targetPath = options.targetPath;

    // package 的存储路径
    this.storeDir = options.storeDir;
    // package 的 name

    this.packageName = options.packageName;

    // package 的版本号
    this.packageVersion = options.packageVersion;

    // package 缓存目录前缀
    this.cachFilePathPrefix = this.packageName.replace("/", "+");
  }

  /**
   * 获取缓存目录文件名
   */
  get cachFilePath() {
    // .store/@imooc-cli+init@1.1.0/node_modules/@imooc-cli/init/lib
    return path.resolve(
      this.storeDir,
      `.store/${this.cachFilePathPrefix}@${this.packageVersion}/node_modules/${this.packageName}`
    );
  }

  /**
   * 获取指定缓存目录文件名
   * @param {*} version
   */
  getSpecificCachFilePath(version) {
    return path.resolve(
      this.storeDir,
      `.store/${this.cachFilePathPrefix}@${version}/node_modules/${this.packageName}`
    );
  }

  async prepare() {
    /**
     * 缓存文件不存在时
     */
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }

    if (this.packageVersion === "latest") {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cachFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  async install() {
    await this.prepare();

    npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      register: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }

  // 更新 package
  async update () {
    await this.prepare();
    // 1、获取最新的版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    // 2、查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCachFilePath(latestPackageVersion);
    // 3、如果不存在，则直接安装最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(true),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion
          }
        ]
      });
    }
    // 更新到最新的版本号
    this.packageVersion = latestPackageVersion;
    return latestFilePath;
  }

  getRootFilePath() {
    /**
     * rp init test-project --debug --force
     * rp init test-project --targetPath /Users/yuyayong/Documents/github/rapid/rapid-cli/commands/init --debug --force
     */

    function _getRootFile (targetPath) {
      const dir = pkgDir(targetPath);

      if (dir) {
        const pkgFile = require(path.resolve(dir, "package.json"));

        if (pkgFile && (pkgFile.main || pkgFile.lib)) {
          if (pkgFile.main) {
            return formatPath(path.resolve(dir, pkgFile.main));
          }

          if (pkgFile.lib) {
            return formatPath(path.resolve(dir, pkgFile.lib));
          }
        }
      }
    }
    

    if (this.storeDir) {
      return _getRootFile(this.cachFilePath);
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package;
