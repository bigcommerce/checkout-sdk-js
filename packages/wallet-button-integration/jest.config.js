module.exports = {
    displayName: 'wallet-button-integration',
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
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    setupFilesAfterEnv: ['../../jest-setup.js'],
    coveragePathIgnorePatterns: ['<rootDir>/src/index.ts'],
    coverageDirectory: '../../coverage/packages/wallet-button-integration',
};
