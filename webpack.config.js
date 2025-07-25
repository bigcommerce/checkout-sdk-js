const path = require('path');
const nodeExternals = require('webpack-node-externals');

const {
    babelLoaderRules,
    getBaseConfig,
    libraryEntries,
    libraryName,
    coreSrcPath,
} = require('./webpack-common.config');

const outputPath = path.join(__dirname, 'dist');

async function getUmdConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);

    return {
        ...baseConfig,
        name: 'umd',
        entry: libraryEntries,
        output: {
            filename: '[name].umd.js',
            library: libraryName,
            libraryTarget: 'umd',
            path: outputPath,
        },
        module: {
            rules: [...babelLoaderRules, ...baseConfig.module.rules],
        },
    };
}

async function getEsmConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);

    return {
        ...baseConfig,
        name: 'esm',
        entry: libraryEntries,
        externals: [nodeExternals()],
        output: {
            filename: '[name].js',
            libraryTarget: 'module',
            path: outputPath,
        },
        experiments: {
            outputModule: true,
        },
    };
}

async function getEssentialBuildEsmConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, { ...argv, essentialBuild: true });

    return {
        ...baseConfig,
        name: 'esm',
        entry: {
            'checkout-sdk-essential': path.join(coreSrcPath, 'bundles', 'checkout-sdk.ts'),
        },
        externals: [nodeExternals()],
        output: {
            filename: '[name].js',
            libraryTarget: 'module',
            path: outputPath,
        },
        experiments: {
            outputModule: true,
        },
    };
}

async function getEssentialBuildUmdConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, { ...argv, essentialBuild: true });

    return {
        ...baseConfig,
        name: 'umd',
        entry: {
            'checkout-sdk-essential': path.join(coreSrcPath, 'bundles', 'checkout-sdk.ts'),
        },
        output: {
            filename: '[name].umd.js',
            library: libraryName,
            libraryTarget: 'umd',
            path: outputPath,
        },
        module: {
            rules: [...babelLoaderRules, ...baseConfig.module.rules],
        },
    };
}

async function getConfigs(options, argv) {
    return [
        await getEsmConfig(options, argv),
        await getUmdConfig(options, argv),
        await getEssentialBuildEsmConfig(options, argv),
        await getEssentialBuildUmdConfig(options, argv),
    ];
}

module.exports = getConfigs;
