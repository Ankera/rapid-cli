'use strict';



const log = require('npmlog')

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

log.heading = 'Rapid-CLI';
log.headingStyle = { fg: 'red', bg: 'black', bold: true }

log.addLevel('success', 2000, { fg: 'green', bold: true })

log.addLevel('version', 2000, { fg: 'green', bold: true })

module.exports = log;
