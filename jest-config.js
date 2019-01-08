module.exports = {
    browser: true,
    preset: 'ts-jest',
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
    ],
    setupTestFrameworkScriptFile: '<rootDir>/jest-setup.js',
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
    ],
    coveragePathIgnorePatterns: [
        '\\.mock\\.(js|ts)$',
        '\\.typedef\\.(js|ts)$',
        '\\.d\\.ts$',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig-jest.json',
        },
    },
};
