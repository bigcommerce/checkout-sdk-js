const path = require('path');

const { projects } = require('../../workspace.json');

const tsSrcPackages = [];
const esbuildSrcPackages = [];
const aliasMap = {};

Object.entries(projects).forEach(([packageName, packagePath]) => {
    const packageSrcPath = path.join(__dirname, '../../', `${packagePath}/src`);

    // Original ts-loader rules (kept for fallback)
    tsSrcPackages.push({
        test: /\.[tj]s$/,
        include: packageSrcPath,
        loader: 'ts-loader',
    });

    // New esbuild-loader rules for all packages
    esbuildSrcPackages.push({
        test: /\.[tj]s$/,
        include: packageSrcPath,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
            target: 'es2018', // Modern target without IE 11
            loader: 'ts',
        },
    });

    aliasMap[`@bigcommerce/checkout-sdk/${packageName}`] = packageSrcPath;
});

module.exports = {
    aliasMap,
    tsSrcPackages,
    esbuildSrcPackages,
};
