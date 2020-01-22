const path = require('path');

const srcPath = path.join(__dirname, 'src');

const libraryName = 'checkoutKit';

const libraryEntries = {
    'checkout-sdk': path.join(srcPath, 'bundles', 'checkout-sdk.ts'),
    'checkout-button': path.join(srcPath, 'bundles', 'checkout-button.ts'),
    'embedded-checkout': path.join(srcPath, 'bundles', 'embedded-checkout.ts'),
    'hosted-form': path.join(srcPath, 'bundles', 'hosted-form.ts'),
    'internal-mappers': path.join(srcPath, 'bundles', 'internal-mappers.ts'),
};

const baseConfig = {
    devtool: 'source-map',
    mode: 'production',
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
                test: /\.[tj]s$/,
                enforce: 'pre',
                loader: require.resolve('source-map-loader'),
            },
            {
                test: /\.[tj]s$/,
                include: srcPath,
                loader: 'ts-loader',
            },
        ],
    },
};

const babelLoaderRule = {
    test: /\.[tj]s$/,
    include: srcPath,
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
};

module.exports = {
    babelLoaderRule,
    baseConfig,
    libraryEntries,
    libraryName,
    srcPath,
};
