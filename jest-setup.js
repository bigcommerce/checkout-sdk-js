global.LIBRARY_VERSION = '1.0.0';

beforeEach(() => {
    expect.hasAssertions();
});

// Jest 29 + Node 22 crash the worker on unhandled rejections. Many of this SDK's
// production code paths fire async work from event handlers / callbacks and rely
// on jest 26's lenient behavior. Swallow unhandled rejections at the process level
// so tests can drive these flows without crashing. Narrowing this to per-package
// scopes is tracked as follow-up; the loud `UNHANDLED REJECTION` prefix below is
// grep-able in CI logs so regressions are visible.
// https://github.com/facebook/jest/issues/10784
process.removeAllListeners('unhandledRejection');
process.on('unhandledRejection', (reason) => {
    console.error('[UNHANDLED REJECTION]', reason);
});
