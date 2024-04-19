module.exports = {
    displayName: "test-utils",
    preset: "../../jest.preset.js",
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.spec.json",
            diagnostics: false,
        },
    },
    setupFilesAfterEnv: ["../../jest-setup.js"],
    coverageDirectory:
        "../../coverage/packages/payment-integrations-test-utils",
};
