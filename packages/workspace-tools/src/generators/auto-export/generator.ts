import { Tree, readProjectConfiguration, generateFiles } from '@nrwl/devkit';
import { basename, join, parse } from 'path';

import autoExport from './auto-export';
import isAutoExportConfig from './is-auto-export-config';

export interface AutoExportGeneratorOptions {
    config: string;
    projectName: string;
}

export default async function autoExportGenerator(
    tree: Tree,
    options: AutoExportGeneratorOptions
) {
    const libraryRoot = readProjectConfiguration(tree, options.projectName).root;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(join(
        tree.root,
        libraryRoot,
        options.config
    ));

    if (!isAutoExportConfig(config)) {
        throw new Error('The specified config file does not conform to the expected schema.');
    }

    await Promise.all(
        config.entries.map(async entry => {
            generateFiles(
                tree,
                join(__dirname, './templates'),
                parse(entry.outputPath).dir,
                {
                    content: await autoExport(entry),
                    outputName: basename(entry.outputPath),
                }
            );
        })
    );
}
