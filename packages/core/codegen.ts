import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: 'packages/core/schema/storefront.graphql',
    documents: ['packages/core/src/**/*.graphql'],
    generates: {
        'packages/core/src/generated-codegen/': {
            preset: 'client',
            presetConfig: {
                fragmentMasking: false,
            },
            config: {
                documentMode: 'string',
                enumsAsTypes: true,
                skipTypename: true,
                immutableTypes: true,
                onlyOperationTypes: true,
            },
        },
    },
};

export default config;
