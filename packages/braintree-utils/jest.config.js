module.exports = {
    displayName: 'braintree-utils',
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
    coverageDirectory: '../../coverage/packages/braintree-utils',
};
