module.exports = {
    displayName: 'google-pay-integration',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        },
    },
    setupFilesAfterEnv: ['../../jest-setup.js'],
    coverageDirectory: '../../coverage/packages/google-pay-integration',
};
