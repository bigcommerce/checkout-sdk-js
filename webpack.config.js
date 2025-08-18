const fs = require('fs');
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
        externals: [esmExternals()],
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

function esmExternals() {
    return ({ request }, callback) => {
        if (!request || request.startsWith('.') || request.startsWith('/')) {
            return callback();
        }

        const packageName = request.startsWith('@')
            ? request.split('/').slice(0, 2).join('/')
            : request.split('/')[0];

        const packagePath = path.join(
            path.join(__dirname, 'node_modules'),
            packageName,
            'package.json',
        );

        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            if (packageJson.module) {
                return callback(null, request);
            }
        }

        return callback();
    };
}

async function getConfigs(options, argv) {
    return [await getCjsConfig(options, argv), await getEsmConfig(options, argv)];
}

module.exports = getConfigs;
