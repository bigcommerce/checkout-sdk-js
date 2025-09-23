const { execFileSync } = require('child_process');
const path = require('path');
const { major } = require('semver');
const { DefinePlugin } = require('webpack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const { getNextVersion, transformManifest } = require('./scripts/webpack');
const { getPackageLoaderRules } = require('./scripts/webpack/package-loader-rule');
const {
    babelLoaderRules,
    getBaseConfig,
    libraryEntries,
    libraryName,
    coreSrcPath,
} = require('./webpack-common.config');

const baseOutputPath = path.join(__dirname, 'dist-cdn');

async function getCdnConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);
    const version = await getNextVersion();
    const versionDir = `v${major(version)}`;
    const outputPath = path.join(baseOutputPath, versionDir);
    const tsSrcPackages = getPackageLoaderRules('cjs');

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
            rules: [...babelLoaderRules, ...baseConfig.module.rules, ...tsSrcPackages],
        },
        plugins: [
            ...baseConfig.plugins,
            new WebpackAssetsManifest({
                entrypoints: true,
                output: path.join(outputPath, 'manifest.json'),
                publicPath: path.join(versionDir, '/'),
                transform: (assets) => transformManifest(assets, version),
            }),
        ],
    };
}

async function getCdnLoaderConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);
    const version = await getNextVersion();
    const outputPath = path.join(baseOutputPath, `v${major(version)}`);

    return {
        ...baseConfig,
        name: 'umd-loader',
        entry: {
            loader: path.join(coreSrcPath, 'loader-cdn.ts'),
        },
        output: {
            filename: `[name]-v${version}.js`,
            library: `${libraryName}Loader`,
            libraryTarget: 'umd',
            path: outputPath,
        },
        module: {
            rules: [...babelLoaderRules, ...baseConfig.module.rules],
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
                        execFileSync('cp', [
                            path.join(outputPath, `loader-v${version}.js`),
                            path.join(outputPath, `loader.js`),
                        ]);
                    });
                },
            },
        ],
    };
}

// This configuration is for building distribution files for CDN deployment
async function getConfigs(options, argv) {
    if (argv.configName.includes('umd-loader')) {
        return await getCdnLoaderConfig(options, argv);
    }

    return await getCdnConfig(options, argv);
}

module.exports = getConfigs;
