'use strict';

const Package = require('@rapid-cli/package');

function exec() {
    // TODO
    console.log('111==', process.env.CLI_TARGET_PATH)

    const pkg = new Package();
}

module.exports = exec;
