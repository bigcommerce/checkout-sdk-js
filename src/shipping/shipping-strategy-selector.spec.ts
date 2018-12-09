import { getErrorResponse } from '../common/http-request/responses.mock';

import ShippingStrategySelector from './shipping-strategy-selector';
import { DEFAULT_STATE } from './shipping-strategy-state';

describe('ShippingStrategySelector', () => {
    let selector: ShippingStrategySelector;
    let state: any;

    beforeEach(() => {
        state = {
            shippingStrategy: DEFAULT_STATE,
        };
    });

    describe('#getUpdateAddressError()', () => {
        it('returns error if unable to update address', () => {
            const updateAddressError = getErrorResponse();

            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { updateAddressError },
            });

            expect(selector.getUpdateAddressError()).toEqual(updateAddressError);
        });

        it('does not returns error if able to update address', () => {
            selector = new ShippingStrategySelector(state.shippingStrategy);

            expect(selector.getUpdateAddressError()).toBeUndefined();
        });
    });

    describe('#getSelectOptionError()', () => {
        it('returns error if unable to select option', () => {
            const selectOptionError = getErrorResponse();

            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { selectOptionError },
            });

            expect(selector.getSelectOptionError()).toEqual(selectOptionError);
        });

        it('does not returns error if able to select option', () => {
            selector = new ShippingStrategySelector(state.shippingStrategy);

            expect(selector.getSelectOptionError()).toBeUndefined();
        });
    });

    describe('#getInitializeError()', () => {
        it('returns error if unable to initialize any method', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError('foobar')).toEqual(getErrorResponse());
            expect(selector.getInitializeError('bar')).toEqual(undefined);
        });

        it('does not return error if able to initialize', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                errors: {},
            });

            expect(selector.getInitializeError()).toEqual(undefined);
        });
    });

    describe('#isUpdatingAddress()', () => {
        it('returns true if updating address', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { isUpdatingAddress: true },
            });

            expect(selector.isUpdatingAddress()).toEqual(true);
        });

        it('returns false if not updating address', () => {
            selector = new ShippingStrategySelector(state.shippingStrategy);

            expect(selector.isUpdatingAddress()).toEqual(false);
        });
    });

    describe('#isSelectingOption()', () => {
        it('returns true if selecting option', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { isSelectingOption: true },
            });

            expect(selector.isSelectingOption()).toEqual(true);
        });

        it('returns false if not selecting option', () => {
            selector = new ShippingStrategySelector(state.shippingStrategy);

            expect(selector.isSelectingOption()).toEqual(false);
        });
    });

    describe('#isInitializing()', () => {
        it('returns true if initializing any method', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing()).toEqual(true);
        });

        it('returns true if initializing specific method', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing('foobar')).toEqual(true);
            expect(selector.isInitializing('bar')).toEqual(false);
        });

        it('returns false if not initializing method', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { initializeMethodId: undefined, isInitializing: false },
            });

            expect(selector.isInitializing()).toEqual(false);
        });
    });

    describe('#isInitialized()', () => {
        it('returns true if method is initialized', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                data: { foobar: { isInitialized: true } },
            });

            expect(selector.isInitialized('foobar')).toEqual(true);
        });

        it('returns false if method is not initialized', () => {
            selector = new ShippingStrategySelector({
                ...state.shippingStrategy,
                data: { foobar: { isInitialized: false } },
            });

            expect(selector.isInitialized('foobar')).toEqual(false);
            expect(selector.isInitialized('bar')).toEqual(false);
        });
    });
});
