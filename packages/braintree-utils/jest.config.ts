/* eslint-disable */
export default {
    displayName: 'braintree-utils',
    preset: '../../jest.preset.js',
    globals: {},
    transform: {
        '^.+\\.[tj]sx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                diagnostics: false,
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    setupFilesAfterEnv: ['../../jest-setup.js'],
    coverageDirectory: '../../coverage/packages/braintree-utils',
    coveragePathIgnorePatterns: ['<rootDir>/src/index.ts', '<rootDir>/src/utils/index.ts'],
};
