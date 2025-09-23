const path = require('path');
const nodeExternals = require('webpack-node-externals');

const { getBaseConfig, libraryEntries, coreSrcPath } = require('./webpack-common.config');
const { getPackageLoaderRules } = require('./scripts/webpack/package-loader-rule');

const outputPath = path.join(__dirname, 'dist');

async function getEsmConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);
    const tsSrcPackages = getPackageLoaderRules('esm');

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
        module: {
            ...baseConfig.module,
            rules: [...baseConfig.module.rules, ...tsSrcPackages],
        },
    };
}

async function getCjsConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);
    const tsSrcPackages = getPackageLoaderRules('cjs');

    return {
        ...baseConfig,
        name: 'cjs',
        entry: libraryEntries,
        output: {
            filename: '[name].js',
            libraryTarget: 'commonjs2',
            path: `${outputPath}/cjs`,
        },
        module: {
            ...baseConfig.module,
            rules: [...baseConfig.module.rules, ...tsSrcPackages],
        },
    };
}

async function getEssentialBuildEsmConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, { ...argv, essentialBuild: true });
    const tsSrcPackages = getPackageLoaderRules('esm');

    return {
        ...baseConfig,
        name: 'esm-essential',
        entry: {
            'checkout-sdk-essential': path.join(
                coreSrcPath,
                'bundles',
                'checkout-sdk-essential.ts',
            ),
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
        module: {
            ...baseConfig.module,
            rules: [...baseConfig.module.rules, ...tsSrcPackages],
        },
    };
}

async function getEssentialBuildCjsConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, { ...argv, essentialBuild: true });
    const tsSrcPackages = getPackageLoaderRules('cjs');

    return {
        ...baseConfig,
        name: 'cjs-essential',
        entry: {
            'checkout-sdk-essential': path.join(
                coreSrcPath,
                'bundles',
                'checkout-sdk-essential.ts',
            ),
        },
        output: {
            filename: '[name].js',
            libraryTarget: 'commonjs2',
            path: `${outputPath}/cjs`,
        },
        module: {
            ...baseConfig.module,
            rules: [...baseConfig.module.rules, ...tsSrcPackages],
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
