"use strict";
const path = require("path");

/**
 * 不同操作系统分割符不一样
 * mac /
 * window //
 * @param {*} p 
 * @returns 
 */
function formatPath(p) {
  if (p) {
    const sep = path.sep;
    if (sep === "/") {
      return p;
    } else {
      return p.replace(/\\/g, "/");
    }
  }
  return p;
}

module.exports = formatPath;
