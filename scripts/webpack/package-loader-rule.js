const path = require('path');

const { projects } = require('../../workspace.json');

function getPackageLoaderRules(format) {
    const tsSrcPackages = [];

    Object.entries(projects).forEach(([_, packagePath]) => {
        const packageSrcPath = path.join(__dirname, '../../', `${packagePath}/src`);

        tsSrcPackages.push({
            test: /\.[tj]s$/,
            include: packageSrcPath,
            loader: 'esbuild-loader',
            options: {
                loader: 'ts',
                target: 'es6',
                format: ['cjs', 'esm'].includes(format) ? format : 'esm',
            },
        });
    });

    return tsSrcPackages;
}

function getPackageAliases() {
    const aliasMap = {};

    Object.entries(projects).forEach(([packageName, packagePath]) => {
        const packageSrcPath = path.join(__dirname, '../../', `${packagePath}/src`);

        aliasMap[`@bigcommerce/checkout-sdk/${packageName}`] = packageSrcPath;
    });

    return aliasMap;
}

module.exports = {
    getPackageLoaderRules,
    getPackageAliases,
};
