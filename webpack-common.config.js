const path = require('path');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { DefinePlugin } = require('webpack');

const {
    getNextVersion,
    packageLoaderRules: { aliasMap: alias, tsSrcPackages },
} = require('./scripts/webpack');

const libraryName = 'checkoutKit';

const coreSrcPath = path.join(__dirname, 'packages/core/src');
const hostedFormV2SrcPath = path.join(__dirname, 'packages/hosted-form-v2/src');

const libraryEntries = {
    'checkout-sdk': path.join(coreSrcPath, 'bundles', 'checkout-sdk.ts'),
    'checkout-button': path.join(coreSrcPath, 'bundles', 'checkout-button.ts'),
    'embedded-checkout': path.join(coreSrcPath, 'bundles', 'embedded-checkout.ts'),
    extension: path.join(coreSrcPath, 'bundles', 'extension.ts'),
    'hosted-form': path.join(coreSrcPath, 'bundles', 'hosted-form.ts'),
    'internal-mappers': path.join(coreSrcPath, 'bundles', 'internal-mappers.ts'),
    'hosted-form-v2-iframe-content': path.join(
        hostedFormV2SrcPath,
        'bundles',
        'hosted-form-v2-iframe-content.ts',
    ),
    'hosted-form-v2-iframe-host': path.join(
        hostedFormV2SrcPath,
        'bundles',
        'hosted-form-v2-iframe-host.ts',
    ),
};

async function getBaseConfig() {
    return {
        stats: {
            errorDetails: true,
            logging: 'verbose',
        },
        devtool: 'source-map',
        mode: 'production',
        resolve: {
            extensions: ['.ts', '.js'],
            alias,
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
                ...tsSrcPackages,
            ],
        },
        plugins: [
            new DefinePlugin({
                LIBRARY_VERSION: JSON.stringify(await getNextVersion()),
            }),
        ],
    };
}

const babelEnvPreset = [
    '@babel/preset-env',
    {
        corejs: 3,
        targets: ['defaults'], // Removed IE 11 support
        useBuiltIns: 'usage',
    },
];

// Hybrid approach: esbuild for source code (no node_modules processing needed)
const hybridLoaderRules = [
    {
        test: /\.[tj]s$/,
        loader: 'esbuild-loader',
        include: coreSrcPath,
        exclude: /node_modules/,
        options: {
            target: 'es2018', // Modern target without IE 11
            loader: 'ts',
        },
    },
    // node_modules are already transpiled - no processing needed
];

// esbuild-loader rules for maximum speed (no polyfills, no node_modules)
const esbuildLoaderRules = [
    {
        test: /\.[tj]s$/,
        loader: 'esbuild-loader',
        include: coreSrcPath,
        exclude: /node_modules/,
        options: {
            target: 'es2018', // Modern target without IE 11
            loader: 'ts',
        },
    },
];

// Keep babel-loader rules for fallback/comparison (also exclude node_modules)
const babelLoaderRules = [
    {
        test: /\.[tj]s$/,
        loader: 'babel-loader',
        include: coreSrcPath,
        exclude: /node_modules/,
        options: {
            presets: [babelEnvPreset],
        },
    },
];

// Speed measure plugin wrapper function
function wrapWithSpeedMeasurePlugin(config) {
    if (process.env.WEBPACK_ANALYZE_SPEED) {
        const smp = new SpeedMeasurePlugin({
            outputFormat: 'human',
            outputTarget: (data) => {
                // eslint-disable-next-line no-console
                console.log(data);
            },
        });

        return smp.wrap(config);
    }

    return config;
}

module.exports = {
    babelLoaderRules,
    esbuildLoaderRules,
    hybridLoaderRules,
    getBaseConfig,
    libraryEntries,
    libraryName,
    coreSrcPath,
    wrapWithSpeedMeasurePlugin,
};
