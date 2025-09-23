const { getPackageAliases, getPackageLoaderRules } = require('./package-loader-rule');

module.exports = {
    getNextVersion: require('./get-next-version'),
    transformManifest: require('./transform-manifest'),
    getPackageAliases,
    getPackageLoaderRules,
};
