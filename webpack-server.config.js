const path = require('path');
const semver = require('semver');
const { DefinePlugin } = require('webpack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const { transformManifest } = require('./scripts/webpack');
const { babelLoaderRule, baseConfig, libraryEntries, libraryName, srcPath } = require('./webpack-common.config');

const version = require('./package.json').version;
const versionDir = `v${semver.major(version)}`;
const outputPath = path.join(__dirname, 'dist-server', versionDir);

function getServerConfig() {
    return {
        ...baseConfig,
        name: 'umd',
        entry: libraryEntries,
        output: {
            filename: '[name]-[contenthash:8].js',
            library: libraryName,
            libraryTarget: 'umd',
            path: outputPath,
        },
        module: {
            rules: [
                babelLoaderRule,
                ...baseConfig.module.rules,
            ],
        },
        plugins: [
            new WebpackAssetsManifest({
                entrypoints: true,
                output: path.join(outputPath, 'manifest.json'),
                publicPath: path.join(process.env.ASSET_HOST || '__ASSET_HOST__', versionDir, '/'),
                transform: assets => transformManifest(assets, version),
            }),
        ],
    };
}

function getServerLoaderConfig() {
    return {
        ...baseConfig,
        name: 'umd-loader',
        entry: {
            loader: path.join(srcPath, 'loader.ts'),
        },
        output: {
            filename: '[name].js',
            library: `${libraryName}Loader`,
            libraryTarget: 'umd',
            path: outputPath,
        },
        module: {
            rules: [
                babelLoaderRule,
                ...baseConfig.module.rules,
            ],
        },
        plugins: [
            new DefinePlugin({
                LIBRARY_NAME: JSON.stringify(libraryName),
                MANIFEST_JSON: JSON.stringify(require(path.join(outputPath, 'manifest.json'))),
            }),
        ],
    };
}

// This configuration is for building distribution files for the static server
// instead of the NPM package.
function getConfigs(options, argv) {
    if (argv.configName === 'umd-loader') {
        return getServerLoaderConfig(options, argv);
    }

    return getServerConfig(options, argv);
}

module.exports = getConfigs;
