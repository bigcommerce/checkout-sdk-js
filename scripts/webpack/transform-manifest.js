const { flatMap } = require('lodash');

function transformManifest(assets, version) {
    return {
        version,
        js: flatMap(Object.values(assets.entrypoints), entry => entry.js),
    };
}

module.exports = transformManifest;
