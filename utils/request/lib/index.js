'use strict';

const axios = require('axios');

/**
 * 封装接口
 */
function request () {
  console.log('================================');
}

// -----------------------------下面是模拟数据-----------------------------------

const apiConfig = [
  {
    name: "Rapid Vue3 基础模板", // 这个是正常的npm已发布
    npmName: "rapid-base-vue3-template",
    version: "1.0.0",
    type: "normal",
    installCommand: "npm install",
    startCommand: "npm run start",
    tag: ["project"],
    ignore: [
      "**/public/**"
    ]
  },
  {
    name: "Rapid Vue3 Admin 通用后台模块", // 这个是正常的npm已发布
    npmName: "rapid-vue3-admin-template",
    version: "1.0.0",
    type: "normal",
    installCommand: "npm install",
    startCommand: "npm run start",
    tag: ["project"],
    ignore: [
      "**/public/**"
    ]
  },
  {
    name: "react中台管理系统", // 这个是正常的npm已发布
    npmName: "arg-react-cli-template",
    version: "3.0.0",
    type: "normal",
    installCommand: "cnpm install",
    startCommand: "cnpm run start",
    tag: ["project"],
    ignore: [
      "**/public/**"
    ]
  },
  {
    name: "react基础UI组件库", // 这个是正常的npm已发布
    npmName: "arg-react-cli-component",
    version: "1.0.0",
    type: "normal",
    installCommand: "npm install",
    startCommand: "npm run start",
    tag: ["component"],
    ignore: [
      "**/public/**"
    ]
  },
  {
    name: "rapid Vu3 组件库", // 这个是正常的npm已发布
    npmName: "rapid-base-vue3-component",
    version: "1.0.0",
    type: "normal",
    installCommand: "npm install",
    startCommand: "npm run serve",
    tag: ["component"],
    ignore: [
      "**/public/**", "**.png"
    ]
  },
  {
    name: "rapid 自定义模块", // 这个是正常的npm已发布
    npmName: "rapid-test-custom",
    version: "1.0.2",
    type: "custom",
    installCommand: "npm install",
    startCommand: "npm run serve",
    tag: ["project"],
    ignore: [
      "**/public/**", "**.png"
    ]
  },
  {
    name: "自定义模板",
    npmName: "arg-react-cli-template-444",
    version: "1.0.0",
    type: "custom",
    installCommand: "npm install",
    startCommand: "npm run start",
    tag: ["project"],
    ignore: [
      "**/public/**", "**.png"
    ]
  },
]

function getTemplate () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(apiConfig)
    }, 2000)
  })
}

module.exports = getTemplate;