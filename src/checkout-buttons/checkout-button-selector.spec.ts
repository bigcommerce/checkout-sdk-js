import CheckoutButtonSelector from './checkout-button-selector';
import CheckoutButtonState from './checkout-button-state';
import { getCheckoutButtonState } from './checkout-buttons.mock';

describe('CheckoutButtonSelector', () => {
    let state: CheckoutButtonState;

    describe('#isInitializing()', () => {
        beforeEach(() => {
            state = {
                ...getCheckoutButtonState(),
                statuses: {
                    foobar: {
                        isInitializing: true,
                    },
                    foobar2: {
                        isInitializing: true,
                    },
                },
            };
        });

        it('returns true if initializing checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.isInitializing('foobar')).toEqual(true);
            expect(selector.isInitializing('foobar2')).toEqual(true);
        });

        it('returns true if initializing any checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.isInitializing()).toEqual(true);
        });

        it('returns false if not initializing checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.isInitializing('not_foobar')).toEqual(false);
        });

        it('returns false if not initializing any checkout button', () => {
            state = getCheckoutButtonState();

            const selector = new CheckoutButtonSelector(state);

            expect(selector.isInitializing()).toEqual(false);
        });
    });

    describe('#isDeinitializing()', () => {
        beforeEach(() => {
            state = {
                ...getCheckoutButtonState(),
                statuses: {
                    foobar: {
                        isDeinitializing: true,
                    },
                    foobar2: {
                        isDeinitializing: true,
                    },
                },
            };
        });

        it('returns true if deinitializing checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.isDeinitializing('foobar')).toEqual(true);
            expect(selector.isDeinitializing('foobar2')).toEqual(true);
        });

        it('returns true if deinitializing any checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.isDeinitializing()).toEqual(true);
        });

        it('returns false if not deinitializing checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.isDeinitializing('not_foobar')).toEqual(false);
        });

        it('returns false if not deinitializing any checkout button', () => {
            state = getCheckoutButtonState();

            const selector = new CheckoutButtonSelector(state);

            expect(selector.isDeinitializing()).toEqual(false);
        });
    });

    describe('#getInitializeError()', () => {
        let expectedError: Error;
        let expectedError2: Error;

        beforeEach(() => {
            expectedError = new Error('Unable to initialize foobar');
            expectedError2 = new Error('Unable to initialize foobar2');

            state = {
                ...getCheckoutButtonState(),
                errors: {
                    foobar: {
                        initializeError: expectedError,
                    },
                    foobar2: {
                        initializeError: expectedError2,
                    },
                },
            };
        });

        it('returns error if unable to initialize checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.getInitializeError('foobar')).toEqual(expectedError);
            expect(selector.getInitializeError('foobar2')).toEqual(expectedError2);
        });

        it('returns error if unable to initialize any checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.getInitializeError()).toEqual(expectedError);
        });

        it('returns undefined if able to initialize checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.getInitializeError('not_foobar')).toBeUndefined();
        });

        it('returns undefined if there are no issues initializing any checkout button', () => {
            state = getCheckoutButtonState();

            const selector = new CheckoutButtonSelector(state);

            expect(selector.getInitializeError()).toBeUndefined();
        });
    });

    describe('#getDeinitializeError()', () => {
        let expectedError: Error;
        let expectedError2: Error;

        beforeEach(() => {
            expectedError = new Error('Unable to deinitialize foobar');
            expectedError2 = new Error('Unable to deinitialize foobar2');

            state = {
                ...getCheckoutButtonState(),
                errors: {
                    foobar: {
                        deinitializeError: expectedError,
                    },
                    foobar2: {
                        deinitializeError: expectedError2,
                    },
                },
            };
        });

        it('returns error if unable to deinitialize checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.getDeinitializeError('foobar')).toEqual(expectedError);
            expect(selector.getDeinitializeError('foobar2')).toEqual(expectedError2);
        });

        it('returns error if unable to deinitialize any checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.getDeinitializeError()).toEqual(expectedError);
        });

        it('returns undefined if able to deinitialize checkout button', () => {
            const selector = new CheckoutButtonSelector(state);

            expect(selector.getDeinitializeError('not_foobar')).toBeUndefined();
        });

        it('returns undefined if there are no issues deinitializing any checkout button', () => {
            state = getCheckoutButtonState();

            const selector = new CheckoutButtonSelector(state);

            expect(selector.getDeinitializeError()).toBeUndefined();
        });
    });
});
