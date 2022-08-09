const path = require('path');

const packages = [
    'core',
    'apple-pay',
    'payment-integration',
];

const getPackagesWithPath = packages.map(package => {
    const packageSrcPath =  path.join(__dirname, `packages/${package}/src`);

    return {
        test: /\.[tj]s$/,
        include: packageSrcPath,
        loader: 'ts-loader',
    };
});

module.exports = getPackagesWithPath;
