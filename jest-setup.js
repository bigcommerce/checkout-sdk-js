global.LIBRARY_VERSION = '1.0.0';

beforeEach(() => {
    expect.hasAssertions();
});

// https://github.com/facebook/jest/issues/10784
process.on('unhandledRejection', (reason) => {
    console.log(reason);
});
