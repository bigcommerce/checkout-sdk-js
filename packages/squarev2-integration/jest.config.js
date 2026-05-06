const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('../../tsconfig.base.json');

module.exports = {
    displayName: "squarev2-integration",
    preset: "../../jest.preset.js",
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.spec.json",
            diagnostics: false,
        },
    },
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
        // types-only package (no JS entry point), so proxy it to avoid Jest module resolution failure
        "@square/web-payments-sdk-types": "identity-obj-proxy",
    },
    setupFilesAfterEnv: ["../../jest-setup.js"],
    coverageDirectory: "../../coverage/packages/squarev2-integration",
};
