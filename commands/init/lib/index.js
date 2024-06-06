"use strict";

const log = require('@rapid-cli/log')
/**
 * 动态加载init模块
 * 脚手架与业务扩展
 *
 * @param {*} projectName
 * @param {*} cmdObj
 * @param {*} command
 */

const Command = require("@rapid-cli/command");

class InitCommand extends Command {
  init() {
    // anker-cli init  --targetPath /Users/zimu/Documents/gitlab/yw-share/commands/init --force --debug test-project
    this.projectName = this._argv[0] || "";

    this.force = !!this._argv[1].force;

    log.verbose("command projectName ==>", this.projectName);
    log.verbose("command force ==>", this.force.toString());
  }

  exec() {

  }
}

/**
 * 三个公共参数 
 * projectName, cmdObj, command.parent.opts()
 * @param {*} argv 
 * @returns 
 */
function init(argv) {
    return new InitCommand(argv);
}

module.exports.InitCommand = InitCommand;

module.exports = init;
