const path = require('path');
const { projects } = require('./workspace.json');

const packages = [
    'core',
    'apple-pay',
    'payment-integration',
];

const tsSrcPackages = [];

for (const [, packagePath] of Object.entries(projects)) {
    const packageSrcPath =  path.join(__dirname, `${packagePath}/src`);

    tsSrcPackages.push({
        test: /\.[tj]s$/,
        include: packageSrcPath,
        loader: 'ts-loader',
    });
}

module.exports = tsSrcPackages;
