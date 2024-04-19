import { generateFiles, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { basename, join, parse } from 'path';

import extendInterface from './extend-interface';
import isExtendInterfaceConfig from './is-extend-interface-config';

export interface ExtendInterfaceGeneratorOptions {
    config: string;
    projectName: string;
}

export default async function extendInterfaceGenerator(
    tree: Tree,
    options: ExtendInterfaceGeneratorOptions,
) {
    const libraryRoot = readProjectConfiguration(tree, options.projectName).root;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(join(tree.root, libraryRoot, options.config));

    if (!isExtendInterfaceConfig(config)) {
        throw new Error('The specified config file does not conform to the expected schema.');
    }

    await Promise.all(
        config.entries.map(async (entry) => {
            generateFiles(tree, join(__dirname, './templates'), parse(entry.outputPath).dir, {
                content: await extendInterface(entry),
                outputName: basename(entry.outputPath),
            });
        }),
    );
}
