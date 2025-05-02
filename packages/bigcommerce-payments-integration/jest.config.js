module.exports = {
    displayName: 'bigcommerce-payments-integration',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        },
    },
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx'],
    coverageDirectory: '../../coverage/packages/bigcommerce-payments-integration',
    setupFilesAfterEnv: ['../../jest-setup.js'],
};
