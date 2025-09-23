import { generateFiles, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { basename, join, parse } from 'path';

import autoExport from './auto-export';
import isAutoExportConfig from './is-auto-export-config';

export interface AutoExportGeneratorOptions {
    config: string;
    projectName: string;
}

export default async function autoExportGenerator(tree: Tree, options: AutoExportGeneratorOptions) {
    const libraryRoot = readProjectConfiguration(tree, options.projectName).root;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(join(tree.root, libraryRoot, options.config));

    if (!isAutoExportConfig(config)) {
        throw new Error('The specified config file does not conform to the expected schema.');
    }

    const allPackageExports = new Map<string, string[]>();
    const allApiExtractorConfigs = new Map<string, string>();

    await Promise.all(
        config.entries.map(async (entry, entryIndex) => {
            const result = await autoExport({
                ...entry,
                apiExtractorConfig: config.apiExtractorConfig,
            });

            generateFiles(tree, join(__dirname, './templates'), parse(entry.outputPath).dir, {
                content: result.packageExportsGrouped,
                outputName: basename(entry.outputPath),
            });

            result.packageExports.forEach((packageExport, packageName) => {
                const packageOutputPath = parse(
                    config.entries[entryIndex].packageOutputPath.replace(
                        '<moduleName>',
                        packageName.replace(/-integration$/, ''),
                    ),
                ).dir;

                if (!allPackageExports.has(packageOutputPath)) {
                    allPackageExports.set(packageOutputPath, []);
                }

                const existingExports = allPackageExports.get(packageOutputPath) || [];

                allPackageExports.set(packageOutputPath, [...existingExports, packageExport]);
            });

            result.apiExtractorConfigs?.forEach((configContent, packageName) => {
                const packageOutputPath = parse(
                    config.entries[entryIndex].packageOutputPath.replace(
                        '<moduleName>',
                        packageName.replace(/-integration$/, ''),
                    ),
                ).dir;

                allApiExtractorConfigs.set(
                    `${packageOutputPath}/api-extractor.json`,
                    configContent,
                );
            });
        }),
    );

    allPackageExports.forEach((packageExports, packageOutputPath) => {
        generateFiles(tree, join(__dirname, './templates'), packageOutputPath, {
            content: packageExports.join('\n'),
            outputName: 'index.ts',
        });
    });

    allApiExtractorConfigs.forEach((configContent, configPath) => {
        tree.write(configPath, configContent);
    });
}
