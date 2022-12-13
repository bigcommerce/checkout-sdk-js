module.exports = {
    displayName: "offline-integration",
    preset: "../../jest.preset.js",
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.spec.json",
            diagnostics: false,
        },
    },
    setupFilesAfterEnv: ["../../jest-setup.js"],
    coverageDirectory: "../../coverage/packages/offline-integration",
};
