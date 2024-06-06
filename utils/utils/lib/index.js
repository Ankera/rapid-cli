"use strict";
const cp = require('child_process');

function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}


function sleep (ms = 2000) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

function exec (command, args, options) {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  
  return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = {
    isObject,
    sleep,
    exec
};
