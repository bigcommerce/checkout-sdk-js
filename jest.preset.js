const { getJestProjects } = require('@nrwl/jest');
const nxPreset = require('@nrwl/jest/preset');

const projects = getJestProjects().map((project) => {
    return project.replace('<rootDir>', '<rootDir>/../../');
});

console.log('Jest projects are', projects);

module.exports = {
    ...nxPreset,
    projects,
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.mock.ts'],
};
