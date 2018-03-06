import ShippingSelector from './shipping-selector';

describe('ShippingSelector', () => {
    const initialState = { errors: {}, statuses: {} };

    it('returns true if initializing any method', () => {
        const state = {
            ...initialState,
            statuses: { initializingMethod: 'foobar', isInitializing: true },
        };
        const selector = new ShippingSelector(state);

        expect(selector.isInitializing()).toEqual(true);
    });

    it('returns true if initializing specific method', () => {
        const state = {
            ...initialState,
            statuses: { initializingMethod: 'foobar', isInitializing: true },
        };
        const selector = new ShippingSelector(state);

        expect(selector.isInitializing('foobar')).toEqual(true);
        expect(selector.isInitializing('bar')).toEqual(false);
    });

    it('returns false if not initializing', () => {
        const state = {
            ...initialState,
            statuses: { initializingMethod: undefined, isInitializing: false },
        };
        const selector = new ShippingSelector(state);

        expect(selector.isInitializing('foobar')).toEqual(false);
    });

    it('returns error if unable to initialize any method', () => {
        const state = {
            ...initialState,
            errors: { initializeMethod: 'foobar', initializeError: new Error() },
        };
        const selector = new ShippingSelector(state);

        expect(selector.getInitializeError()).toEqual(state.errors.initializeError);
    });

    it('returns error if unable to initialize specific method', () => {
        const state = {
            ...initialState,
            errors: { initializeMethod: 'foobar', initializeError: new Error() },
        };
        const selector = new ShippingSelector(state);

        expect(selector.getInitializeError('foobar')).toEqual(state.errors.initializeError);
        expect(selector.getInitializeError('bar')).toEqual(undefined);
    });

    it('returns undefined if there is no initialization error', () => {
        const selector = new ShippingSelector(initialState);

        expect(selector.getInitializeError()).toEqual(undefined);
    });
});
