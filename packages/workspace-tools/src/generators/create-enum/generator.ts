import { generateFiles, readProjectConfiguration, Tree } from '@nx/devkit';
import { basename, join, parse } from 'path';

import createEnum from './create-enum';
import isCreateEnumConfig from './is-create-enum-config';

export interface CreateEnumGeneratorOptions {
    config: string;
    projectName: string;
}

export default async function generateEnumGenerator(
    tree: Tree,
    options: CreateEnumGeneratorOptions,
) {
    const libraryRoot = readProjectConfiguration(tree, options.projectName).root;

    const config = require(join(tree.root, libraryRoot, options.config));

    if (!isCreateEnumConfig(config)) {
        throw new Error('The specified config file does not conform to the expected schema.');
    }

    await Promise.all(
        config.entries.map(async (entry) => {
            generateFiles(tree, join(__dirname, './templates'), parse(entry.outputPath).dir, {
                content: await createEnum(entry),
                outputName: basename(entry.outputPath),
            });
        }),
    );
}
