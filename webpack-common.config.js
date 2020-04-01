const path = require('path');
const { DefinePlugin } = require('webpack');

const { getNextVersion } = require('./scripts/webpack');

const srcPath = path.join(__dirname, 'src');

const libraryName = 'checkoutKit';

const libraryEntries = {
    'checkout-sdk': path.join(srcPath, 'bundles', 'checkout-sdk.ts'),
    'checkout-button': path.join(srcPath, 'bundles', 'checkout-button.ts'),
    'embedded-checkout': path.join(srcPath, 'bundles', 'embedded-checkout.ts'),
    'hosted-form': path.join(srcPath, 'bundles', 'hosted-form.ts'),
    'internal-mappers': path.join(srcPath, 'bundles', 'internal-mappers.ts'),
};

async function getBaseConfig() {
    return {
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
        include: srcPath,
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
    srcPath,
};
