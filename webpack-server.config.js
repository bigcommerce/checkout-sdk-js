const { execSync } = require('child_process');
const path = require('path');
const { major } = require('semver');
const { DefinePlugin } = require('webpack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const { getNextVersion, transformManifest } = require('./scripts/webpack');
const { babelLoaderRules, getBaseConfig, libraryEntries, libraryName, srcPath } = require('./webpack-common.config');

const baseOutputPath = path.join(__dirname, 'dist-server');

async function getServerConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);
    const version = await getNextVersion();
    const versionDir = `v${major(version)}`;
    const outputPath = path.join(baseOutputPath, versionDir);

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
                ...babelLoaderRules,
                ...baseConfig.module.rules,
            ],
        },
        plugins: [
            ...baseConfig.plugins,
            new WebpackAssetsManifest({
                entrypoints: true,
                output: path.join(outputPath, 'manifest.json'),
                publicPath: path.join(process.env.ASSET_HOST || '__ASSET_HOST__', versionDir, '/'),
                transform: assets => transformManifest(assets, version),
            }),
        ],
    };
}

async function getServerLoaderConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);
    const version = await getNextVersion();
    const outputPath = path.join(baseOutputPath, `v${major(version)}`);

    return {
        ...baseConfig,
        name: 'umd-loader',
        entry: {
            loader: path.join(srcPath, 'loader.ts'),
        },
        output: {
            filename: `[name]-v${version}.js`,
            library: `${libraryName}Loader`,
            libraryTarget: 'umd',
            path: outputPath,
        },
        module: {
            rules: [
                ...babelLoaderRules,
                ...baseConfig.module.rules,
            ],
        },
        plugins: [
            ...baseConfig.plugins,
            new DefinePlugin({
                LIBRARY_NAME: JSON.stringify(libraryName),
                MANIFEST_JSON: JSON.stringify(require(path.join(outputPath, 'manifest.json'))),
            }),
            {
                apply(compiler) {
                    compiler.hooks.done.tap('DuplicateLoader', () => {
                        execSync(`cp ${path.join(outputPath, `loader-v${version}.js`)} ${path.join(outputPath, `loader.js`)}`);
                    });
                },
            },
        ],
    };
}

// This configuration is for building distribution files for the static server
// instead of the NPM package.
async function getConfigs(options, argv) {
    if (argv.configName === 'umd-loader') {
        return await getServerLoaderConfig(options, argv);
    }

    return await getServerConfig(options, argv);
}

module.exports = getConfigs;
