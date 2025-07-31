const path = require('path');

const { projects } = require('../../workspace.json');

const tsSrcPackages = [];
const esbuildSrcPackages = [];
const aliasMap = {};

Object.entries(projects).forEach(([packageName, packagePath]) => {
    const packageSrcPath = path.join(__dirname, '../../', `${packagePath}/src`);

    // New esbuild-loader rules for all packages
    esbuildSrcPackages.push({
        test: /\.[tj]s$/,
        include: packageSrcPath,
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
