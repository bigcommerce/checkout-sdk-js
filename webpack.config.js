const { DefinePlugin } = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const assetConfig = {
    devtool: 'source-map',

    entry: {
        'checkout-sdk': './src/index.ts',
    },

    output: {
        filename: '[name].js',
        library: "checkoutKit",
        path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
        ],
    },

    plugins: [
        new DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new UglifyJSPlugin({
            sourceMap: true,
        }),
    ]
};

module.exports = [
    Object.assign({}, assetConfig, {
        output: Object.assign({}, assetConfig.output, {
            libraryTarget: 'umd',
            filename: '[name].umd.js',
        })
    }),
    Object.assign({}, assetConfig, {
        output: Object.assign({}, assetConfig.output, {
            libraryTarget: 'commonjs2',
        }),
        externals: [
            nodeExternals()
        ],
    })
];
