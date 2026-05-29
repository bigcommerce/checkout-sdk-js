global.LIBRARY_VERSION = '1.0.0';

beforeEach(() => {
    expect.hasAssertions();
});

// Jest 29 + Node 22 crash the worker on unhandled rejections. Many of this SDK's
// production code paths fire async work from event handlers / callbacks and rely
// on jest 26's lenient behavior. Swallow unhandled rejections at the process level
// so tests can drive these flows without crashing.
// https://github.com/facebook/jest/issues/10784
process.removeAllListeners('unhandledRejection');
process.on('unhandledRejection', (reason) => {
    console.log(reason);
});
