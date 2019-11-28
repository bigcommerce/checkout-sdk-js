const { DefinePlugin } = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const assetConfig = {
    devtool: 'source-map',
    mode: 'production',
    target: 'web',

    entry: {
        'checkout-sdk': './src/index.ts',
        'checkout-button': './src/bundles/checkout-button.ts',
        'embedded-checkout': './src/bundles/embedded-checkout.ts',
        'hosted-form': './src/bundles/hosted-form.ts',
        'internal-mappers': './src/bundles/internal-mappers.ts',
    },

    output: {
        filename: '[name].js',
        library: 'checkoutKit',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    module: {
        rules: [
            {
                parser: {
                    amd: false,
                },
            },
            {
                test: /\.(js|ts)$/,
                include: path.resolve(__dirname, 'src'),
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
        module: Object.assign({}, assetConfig.module, {
            rules: [
                {
                    test: /\.(js|ts)$/,
                    include: path.resolve(__dirname, 'src'),
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    corejs: 3,
                                    targets: [
                                        'defaults',
                                        'ie 11',
                                    ],
                                    useBuiltIns: 'usage',
                                },
                            ]
                        ],
                    },
                },
                ...assetConfig.module.rules,
            ],
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
