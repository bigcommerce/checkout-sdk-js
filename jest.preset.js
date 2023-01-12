
const nxPreset = require('@nrwl/jest/preset');

module.exports = {
    ...nxPreset,
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest'
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
    ],
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/**/*.mock.ts'
    ],
}
