#!/usr/bin/env node
const { getNextVersion } = require('../webpack');

getNextVersion()
    .then(version => {
        process.stdout.write(version);
    });
