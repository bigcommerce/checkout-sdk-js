const path = require('path');
const nodeExternals = require('webpack-node-externals');

const { getBaseConfig, libraryEntries, coreSrcPath } = require('./webpack-common.config');

const outputPath = path.join(__dirname, 'dist');

async function getEsmConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);

    return {
        ...baseConfig,
        name: 'esm',
        entry: libraryEntries,
        externals: [
            nodeExternals({
                importType: 'module',
            }),
        ],
        externalsPresets: {
            node: true,
        },
        output: {
            filename: '[name].js',
            path: `${outputPath}/esm`,
            library: {
                type: 'module',
            },
            environment: {
                module: true,
            },
        },
        experiments: {
            outputModule: true,
        },
        target: ['web', 'es6'],
    };
}

async function getCjsConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);

    return {
        ...baseConfig,
        name: 'cjs',
        entry: libraryEntries,
        output: {
            filename: '[name].js',
            libraryTarget: 'commonjs2',
            path: `${outputPath}/cjs`,
        },
    };
}

async function getEssentialBuildEsmConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, { ...argv, essentialBuild: true });

    return {
        ...baseConfig,
        name: 'esm-essential',
        entry: {
            'checkout-sdk-essential': path.join(coreSrcPath, 'bundles', 'checkout-sdk.ts'),
        },
        externals: [
            nodeExternals({
                importType: 'module',
            }),
        ],
        externalsPresets: {
            node: true,
        },
        output: {
            filename: '[name].js',
            path: `${outputPath}/esm`,
            library: {
                type: 'module',
            },
            environment: {
                module: true,
            },
        },
        experiments: {
            outputModule: true,
        },
        target: ['web', 'es6'],
    };
}

async function getEssentialBuildCjsConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, { ...argv, essentialBuild: true });

    return {
        ...baseConfig,
        name: 'cjs-essential',
        entry: {
            'checkout-sdk-essential': path.join(coreSrcPath, 'bundles', 'checkout-sdk.ts'),
        },
        output: {
            filename: '[name].js',
            libraryTarget: 'commonjs2',
            path: `${outputPath}/cjs`,
        },
    };
}

async function getConfigs(options, argv) {
    return [
        await getEsmConfig(options, argv),
        await getEssentialBuildEsmConfig(options, argv),
        await getCjsConfig(options, argv),
        await getEssentialBuildCjsConfig(options, argv),
    ];
}

module.exports = getConfigs;
