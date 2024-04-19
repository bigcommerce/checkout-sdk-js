module.exports = {
    displayName: "adyen-integration",
    preset: "../../jest.preset.js",
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.spec.json",
            diagnostics: false,
        },
    },
    setupFilesAfterEnv: ["../../jest-setup.js"],
    coverageDirectory: "../../coverage/packages/adyen-integration",
};
