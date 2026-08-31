const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../../packages');
const tsConfigFile = path.join(__dirname, '../../tsconfig.base.json');
const projects = Object.fromEntries(
    fs
        .readdirSync(packagesDir, { withFileTypes: true })
        .filter(
            (entry) =>
                entry.isDirectory() &&
                fs.existsSync(path.join(packagesDir, entry.name, 'project.json')),
        )
        .map((entry) => [entry.name, `packages/${entry.name}`]),
);

const tsSrcPackages = [];
const aliasMap = {};

for (const [packageName, packagePath] of Object.entries(projects)) {
    const packageSrcPath = path.join(__dirname, '../../', `${packagePath}/src`);

    tsSrcPackages.push({
        test: /\.[tj]s$/,
        include: packageSrcPath,
        loader: 'ts-loader',
        options: {
            configFile: tsConfigFile,
            onlyCompileBundledFiles: true,
        },
    });

    aliasMap[`@bigcommerce/checkout-sdk/${packageName}`] = packageSrcPath;
}

module.exports = {
    aliasMap,
    tsSrcPackages,
};
