const path = require('path');
const nodeExternals = require('webpack-node-externals');

const { getBaseConfig, libraryEntries } = require('./webpack-common.config');

const outputPath = path.join(__dirname, 'dist');

async function getCjsConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);

    return {
        ...baseConfig,
        name: 'cjs',
        entry: libraryEntries,
        externals: [nodeExternals()],
        output: {
            filename: '[name].js',
            libraryTarget: 'commonjs2',
            path: outputPath,
        },
    };
}

async function getEsmConfig(options, argv) {
    const baseConfig = await getBaseConfig(options, argv);

    return {
        ...baseConfig,
        name: 'esm',
        entry: libraryEntries,
        externalsPresets: { node: true },
        externals: {
            'intl-messageformat': 'intl-messageformat',
            lodash: 'lodash',
            reselect: 'reselect',
            rxjs: 'rxjs',
            tslib: 'tslib',
            yup: 'yup',
        },
        output: {
            filename: '[name].js',
            libraryTarget: 'module',
            path: `${outputPath}/esm`,
        },
        experiments: {
            outputModule: true,
        },
    };
}

async function getConfigs(options, argv) {
    return [await getCjsConfig(options, argv), await getEsmConfig(options, argv)];
}

module.exports = getConfigs;
