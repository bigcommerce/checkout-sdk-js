const path = require('path');
const { DefinePlugin } = require('webpack');
const nodeExternals = require('webpack-node-externals');

const { babelLoaderRule, baseConfig, libraryEntries, libraryName } = require('./webpack-common.config');

const outputPath = path.join(__dirname, 'dist');

function getUmdConfig() {
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
            rules: [
                babelLoaderRule,
                ...baseConfig.module.rules,
            ],
        },
    };
}

function getCjsConfig() {
    return {
        ...baseConfig,
        name: 'cjs',
        entry: libraryEntries,
        externals: [
            nodeExternals()
        ],
        output: {
            filename: '[name].js',
            libraryTarget: 'commonjs2',
            path: outputPath,
        },
        plugins: [
            new DefinePlugin({
                'process.env.NODE_ENV': 'process.env.NODE_ENV',
            }),
        ],
    };
}

function getConfigs(options, argv) {
    return [
        getCjsConfig(options, argv),
        getUmdConfig(options, argv),
    ];
}

module.exports = getConfigs;
