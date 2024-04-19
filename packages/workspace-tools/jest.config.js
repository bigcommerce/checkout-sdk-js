module.exports = {
    displayName: 'workspace-tools',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    setupFilesAfterEnv: ['../../jest-setup.js'],
    coverageDirectory: '../../coverage/packages/workspace-tools',
    collectCoverageFrom: [],
};
