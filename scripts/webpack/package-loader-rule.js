const path = require('path');
const { projects } = require('../../workspace.json');

const tsSrcPackages = [];
const aliasMap = {};

for (const [packageName, packagePath] of Object.entries(projects)) {
    const packageSrcPath =  path.join(__dirname, '../../', `${packagePath}/src`);

    tsSrcPackages.push({
        test: /\.[tj]s$/,
        include: packageSrcPath,
        loader: 'ts-loader',
    });

    aliasMap[`@bigcommerce/checkout-sdk/${packageName}`] = packageSrcPath;
}

module.exports = {
    aliasMap,
    tsSrcPackages
};
