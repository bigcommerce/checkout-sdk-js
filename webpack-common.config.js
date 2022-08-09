const path = require('path');
const { DefinePlugin } = require('webpack');

const { getNextVersion } = require('./scripts/webpack');
const packages = require('./package-loader-rule');

const libraryName = 'checkoutKit';

const coreSrcPath = path.join(__dirname, 'packages/core/src');

const libraryEntries = {
    'checkout-sdk': path.join(coreSrcPath, 'bundles', 'checkout-sdk.ts'),
    'checkout-button': path.join(coreSrcPath, 'bundles', 'checkout-button.ts'),
    'embedded-checkout': path.join(coreSrcPath, 'bundles', 'embedded-checkout.ts'),
    'hosted-form': path.join(coreSrcPath, 'bundles', 'hosted-form.ts'),
    'internal-mappers': path.join(coreSrcPath, 'bundles', 'internal-mappers.ts'),
};

async function getBaseConfig() {
    return {
        stats: {
            errorDetails: true,
            logging: 'verbose'
        },
        devtool: 'source-map',
        mode: 'production',
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@bigcommerce/checkout-sdk/payment-integration': path.resolve(__dirname, '/packages/payment-integration/src'),
                '@bigcommerce/checkout-sdk/apple-pay': path.resolve(__dirname, '/packages/apple-pay/src'),
                '@bigcommerce/checkout-sdk/test-utils': path.resolve(__dirname, '/packages/test-utils/src'),
            }
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
                ...packages
            ],
        },
        plugins: [
            new DefinePlugin({
                'LIBRARY_VERSION': JSON.stringify(await getNextVersion()),
            }),
        ],
    };
};

const babelEnvPreset = [
    '@babel/preset-env',
    {
        corejs: 3,
        targets: [
            'defaults',
            'ie 11',
        ],
        useBuiltIns: 'usage',
    },
];

const babelLoaderRules = [
    {
        test: /\.[tj]s$/,
        loader: 'babel-loader',
        include: coreSrcPath,
        options: {
            presets: [
                babelEnvPreset,
            ],
        },
    },
    {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'node_modules'),
        exclude: [
            /\/node_modules\/core-js\//,
            /\/node_modules\/webpack\//,
        ],
        options: {
            presets: [
                babelEnvPreset,
            ],
            sourceType: 'unambiguous',
        }
    },
];

module.exports = {
    babelLoaderRules,
    getBaseConfig,
    libraryEntries,
    libraryName,
    coreSrcPath,
};
