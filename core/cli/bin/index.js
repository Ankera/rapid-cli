#!/usr/bin/env node

const importLocal = require('import-local');

if (importLocal(__filename)) {
    console.log('====================importLocal', __filename)
    require('npmlog').info('CLI', '正在使用 rapid-cli 本地版本');
} else {
    require('../lib')(process.argv.slice(2));
}