module.exports = {
    browser: true,
    transform: {
        '\\.(ts|js)$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
    ],
    testRegex: 'src/.*\\.spec.(js|ts)$',
    setupTestFrameworkScriptFile: '<rootDir>/jest-setup.js',
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
    ],
    coveragePathIgnorePatterns: [
        '\\.mock\\.(js|ts)$',
        '\\.typedef\\.(js|ts)$',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};
