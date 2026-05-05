/* eslint-disable */
export default {
    displayName: 'moneris-integration',
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
    setupFilesAfterEnv: ['../../jest-setup.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/moneris-integration',
};
