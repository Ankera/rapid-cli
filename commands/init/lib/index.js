"use strict";

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const semver = require("semver");
const fse = require("fs-extra");
const Package = require("@rapid-cli/package");
const ejs = require("ejs");
const userHome = require("user-home");
const log = require("@rapid-cli/log");
const { spinnerStart, sleep, execAsync } = require("@rapid-cli/utils");
const getTemplate = require("@rapid-cli/request");
/**
 * 动态加载init模块
 * 脚手架与业务扩展
 *
 * @param {*} projectName
 * @param {*} cmdObj
 * @param {*} command
 */

const Command = require("@rapid-cli/command");
const { stdin } = require("process");

/**
 * 项目&组件
 */
const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

/**
 * 标准模板&自定义模板
 */
const TEMPLATE_TYPE_NORMAL = "normal";
const TEMPLATE_TYPE_CUSTOM = "custom";

/**
 * 白名单命令
 */
const WHITE_COMMAND = ["npm", "cnpm"];

class InitCommand extends Command {
  init() {
    // anker-cli init  --targetPath /Users/zimu/Documents/gitlab/yw-share/commands/init --force --debug test-project
    this.projectName = this._argv[0] || "";

    this.force = !!this._cmd.force;

    log.verbose("command projectName ==>", this.projectName);
    log.verbose("command force ==>", this.force.toString());
  }

  /**
   * 项目名称不合法命令
   * rp init --targetPath /Users/yuyayong/Documents/github/rapid/rapid-cli/commands/init --force
   */
  /**
   * 1、准备阶段
   * 2、下载模板
   * 3、安装模板
   */
  async exec() {
    try {
      // 1、准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 下载的模板信息
        log.verbose("projectInfo", JSON.stringify(projectInfo));
        this.projectInfo = projectInfo;
        // 2、下载模板
        await this.downloadTemplate();

        // 3、安装模板
        await this.installTemplate();
      }
    } catch (error) {
      log.error("ERR", error.message);
      if (process.env.LOG_LEVEL === "verbose") {
        console.log(error);
      }
    }
  }

  async prepare() {
    const spinner = spinnerStart("Init is loading...");
    /**
     * 判断模板是否存在
     */
    const template = await getTemplate();
    if (!template || template.length == 0) {
      spinner.stop(true);
      throw new Error("项目模板不存在");
    }

    spinner.stop(true);
    this.template = template;

    /**
     * 1、判断当前目录是否为空
     * 2、是否启动强制更新
     * 3、选择创建项目或组件
     * 4、获取项目的基本信息
     */
    const localPath = process.cwd();

    if (!this.isDirEmpty(localPath)) {
      let ifContinueResult = null;
      if (!this.force) {
        ifContinueResult = await inquirer.prompt({
          type: "confirm",
          name: "ifContinue",
          default: false,
          message: "当前文件夹不为空，是否继续创建项目？",
        });

        if (!ifContinueResult.ifContinue) {
          // 终止继续执行
          return;
        }
      }

      if (this.force || ifContinueResult.ifContinue) {
        // 清空文件夹很容易影响程序问题，建议给个二次确认提示
        const { confirmDelete } = await inquirer.prompt({
          type: "confirm",
          name: "confirmDelete",
          default: false,
          message: "是否确认清空当前文件夹？",
        });
        if (confirmDelete) {
          // 清空当前目录
          fse.emptyDirSync(localPath);
        }
      }
    }

    return this.getProjectInfo();
  }

  /**
   * 除了指定文件，是否为空
   * false不为空
   * true为空
   * @param {fs.PathLike} [localPath]
   */
  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter(
      (file) => !file.startsWith(".") && ["node_modules"].indexOf(file) < 0
    );
    return !fileList || fileList.length <= 0;
  }

  /**
   * 选择创建项目或组件,
   * 获取项目的基本信息
   * 返回项目的基本信息
   */
  async getProjectInfo() {
    /**
     * 校验项目名称是否合法
     * @param {*} name
     * @returns
     */
    function isValidName(name) {
      const reg =
        /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;
      return reg.test(name);
    }

    let projectInfo = {};

    let isValidProjectName = false;
    if (isValidName(this.projectName)) {
      isValidProjectName = true;
      projectInfo.projectName = this.projectName;
    }

    const { type } = await inquirer.prompt({
      type: "list",
      name: "type",
      message: "请选择初始化类型",
      default: TYPE_PROJECT,
      choices: [
        {
          name: "项目",
          value: TYPE_PROJECT,
        },
        {
          name: "组件",
          value: TYPE_COMPONENT,
        },
      ],
    });
    log.verbose("TYPE", type);

    this.template = this.template.filter((template) => {
      return template.tag.includes(type);
    });

    /**
     * 过滤选择项目&组件
     */
    this.template = this.template.filter(
      (template) => Array.isArray(template.tag) && template.tag.includes(type)
    );

    const title = type === TYPE_PROJECT ? '项目' : '组件';
    // 2. 获取项目的基本信息
    const projectNamePrompt = {
      type: "input",
      name: "projectName",
      message: `请输入${title}名称`,
      default: "",
      validate: function (v) {
        const done = this.async();
        setTimeout(() => {
          if (!isValidName(v)) {
            done(`请输入合法的${title}名称`);
            return;
          } else {
            done(null, true);
          }
        }, 0);
      },
      filter: (v) => {
        return v;
      },
    };

    const projectPrompt = [];
    if (!isValidProjectName) {
      projectPrompt.push(projectNamePrompt);
    }
    projectPrompt.push(
      {
        type: "input",
        name: "projectVersion",
        message: `请输入${title}版本号`,
        default: "",
        validate: function (v) {
          const done = this.async();
          setTimeout(() => {
            if (!!!semver.valid(v)) {
              done(`请输入${title}版本号`);
              return;
            } else {
              done(null, true);
            }
          }, 0);
        },
        filter: (v) => {
          if (!!semver.valid(v)) {
            return semver.valid(v);
          } else {
            return v;
          }
        },
      },
      {
        type: "list",
        name: "projectTemplate",
        message: `请选择${title}模板`,
        choices: this.createTemplateChoies(),
      }
    );

    if (type === TYPE_PROJECT) {
      const project = await inquirer.prompt(projectPrompt);

      projectInfo = {
        ...projectInfo,
        type,
        ...project,
      };
    } else if (type === TYPE_COMPONENT) {
      // 待补充
      const descriptionPrompt =  {
        type: "input",
        name: "componentDescription",
        message: "请输入组件描述信息",
        default: "",
        validate: function (v) {
          const done = this.async();
          setTimeout(() => {
            if (!v) {
              done("描述信息不能为空~~~");
              return;
            } else {
              done(null, true);
            }
          }, 0);
        }
      }

      projectPrompt.push(descriptionPrompt);
      const component = await inquirer.prompt(projectPrompt);

      projectInfo = {
        ...projectInfo,
        type,
        ...component,
      };
    }

    if (projectInfo.projectName) {
      projectInfo.className = require("kebab-case")(
        projectInfo.projectName
      ).replace(/^-/, "");
    }

    if (projectInfo.projectVersion) {
      projectInfo.version = projectInfo.projectVersion
    }

    if (projectInfo.componentDescription) {
      projectInfo.description = projectInfo.componentDescription;
    }

    return projectInfo;
  }

  createTemplateChoies() {
    return this.template.map((item) => ({
      name: item.name,
      value: item.npmName,
    }));
  }

  async downloadTemplate() {
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find(
      (item) => item.npmName === projectTemplate
    );
    const targetPath = path.resolve(userHome, ".rapid-cli", "template");
    const storeDir = path.resolve(
      userHome,
      ".rapid-cli",
      "template",
      "node_modules"
    );
    const { npmName, version } = templateInfo;
    this.templateInfo = templateInfo;
    log.verbose("templateInfo", JSON.stringify(this.templateInfo));

    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });

    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart("正在下载模板");
      await sleep();
      try {
        await templateNpm.install();
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if ((await templateNpm.exists()) && templateNpm.isCorrect) {
          log.success("下载模板成功");
        }
        this.templateNpm = templateNpm;
      }
    } else {
      const spinner = spinnerStart("正在更新模板");
      await sleep();
      try {
        await templateNpm.update();
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if ((await templateNpm.exists()) && templateNpm.isCorrect) {
          log.success("更新模板成功");
        }
        this.templateNpm = templateNpm;
      }
    }

    log.verbose("templateNpm", JSON.stringify(this.templateNpm));
  }

  // 安装模板
  async installTemplate() {
    if (this.templateInfo) {
      const { type } = this.templateInfo;
      if (!type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      // 安装标准模板
      if (type === TEMPLATE_TYPE_NORMAL) {
        await this.installNormalTemplate();

        // 安装自定义模板
      } else if (type === TEMPLATE_TYPE_CUSTOM) {
        await this.installCustomTemplate();
      } else {
        throw new Error("无法识别模板信息");
      }
    } else {
      throw new Error("模板信息不存在");
    }
  }

  /**
   * 检查命令是否合法
   * @param {*} cmd
   * @returns
   */
  checkCommand(cmd) {
    if (WHITE_COMMAND.includes(cmd)) {
      return cmd;
    }
    return null;
  }

  async execCommand(command, errMessage) {
    let result;
    if (typeof command === "string") {
      let cmdArray = command.split(" ");
      if (cmdArray.length > 0) {
        const cmd = this.checkCommand(cmdArray[0]);
        if (!cmd) {
          throw new Error(`命令不存在!命令：${command}`);
        }

        const args = cmdArray.slice(1);
        result = await execAsync(cmd, args, {
          stdio: "inherit",
          cwd: process.cwd(),
        });
        if (result !== 0) {
          throw new Error(errMessage);
        }
      }
    }
    return result;
  }

  /**
   * 安装标准模板
   */
  async installNormalTemplate() {
    // 1、
    const spinner = spinnerStart("正在安装模板");
    await sleep();
    try {
      const templatePath = path.resolve(
        this.templateNpm.cachFilePath,
        "template"
      );
      const targetPath = process.cwd();

      fse.ensureDirSync(templatePath);
      fse.ensureDirSync(targetPath);
      // 拷贝模板到当前目录
      fse.copySync(templatePath, targetPath);
    } catch (error) {
      throw error;
    } finally {
      spinner.stop(true);
      log.success("模板安装成功");
    }

    // // 替换模板
    // const ignore = ['node_modules/**', 'public/**'];
    const ignore = ["node_modules/**", ...(this.templateInfo.ignore || [])];
    await this.ejsRender({ ignore });

    // // 2、安装依赖
    const { installCommand, startCommand } = this.templateInfo;
    await this.execCommand(installCommand, "依赖安装过程失败");

    // // 3、启动项目
    await this.execCommand(startCommand, "模板启动过程失败");
  }

  /**
   * 渲染模板
   */
  ejsRender(options) {
    const dir = process.cwd();
    const projectInfo = this.projectInfo;
    return new Promise((resolve, reject) => {
      require("glob")(
        "**",
        {
          cwd: dir,
          ignore: options.ignore || "",
          nodir: true,
        },
        (err, files) => {
          if (err) {
            reject(err);
          }
          Promise.all(
            files.map((file) => {
              const filePath = path.join(dir, file);
              return new Promise((resolve1, reject1) => {
                ejs.renderFile(
                  filePath,
                  {
                    className: projectInfo.className,
                    version: projectInfo.projectVersion,
                    description: projectInfo.description,
                  },
                  {},
                  (err, result) => {
                    if (err) {
                      reject1(err);
                    } else {
                      fse.writeFile(filePath, result);
                      resolve1(result);
                    }
                  }
                );
              });
            })
          )
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
    });
  }

  /**
   * 安装自定义模板
   */
  async installCustomTemplate() {
    if (await this.templateNpm.exists()) {
      const rootFile = await this.templateNpm.getRootFilePath();
      if (fs.existsSync(rootFile)) {
        log.notice('开始执行自定义模块');

        const templatePath = path.resolve(this.templateNpm.cachFilePath, 'template');

        const options = {
          templateInfo: this.templateInfo,
          projectInfo: this.projectInfo,
          sourcePath: templatePath,
          targetPath: process.cwd()
        }
        
        const code = `require('${rootFile}')(${JSON.stringify(options)})`;
        
        log.verbose('自定义代码', code)
        await execAsync('node', ['-e', code], {
          stdin: 'inherit',
          cwd: process.cwd()
        })

        log.success('自定义模块执行成功')
      } else {
        throw new Error('自定义模板文件不存在')
      }
    }
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
