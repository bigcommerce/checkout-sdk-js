const path = require('path');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { DefinePlugin } = require('webpack');

const {
    getNextVersion,
    packageLoaderRules: { aliasMap: alias, esbuildSrcPackages },
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
                ...esbuildSrcPackages,
            ],
        },
        plugins: [
            new DefinePlugin({
                LIBRARY_VERSION: JSON.stringify(await getNextVersion()),
            }),
        ],
    };
}

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
    getBaseConfig,
    libraryEntries,
    libraryName,
    coreSrcPath,
    wrapWithSpeedMeasurePlugin,
};
