const { DefinePlugin } = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const assetConfig = {
    devtool: 'source-map',
    mode: 'production',
    target: 'web',

    entry: {
        'checkout-sdk': './src/index.ts',
        'checkout-button': './src/checkout-button.ts',
        'internal-mappers': './src/internal-mappers.ts',
    },

    output: {
        filename: '[name].js',
        library: "checkoutKit",
        libraryTarget: 'commonjs2',
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
};

module.exports = [
    Object.assign({}, assetConfig, {
        name: 'umd',
        output: Object.assign({}, assetConfig.output, {
            libraryTarget: 'umd',
            filename: '[name].umd.js',
        }),
    }),

    Object.assign({}, assetConfig, {
        name: 'cjs',
        externals: [
            nodeExternals()
        ],
        plugins: [
            new DefinePlugin({
                'process.env.NODE_ENV': 'process.env.NODE_ENV',
            }),
        ],
    }),
];
