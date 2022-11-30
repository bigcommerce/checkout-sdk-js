import { getErrorResponse } from '../common/http-request/responses.mock';

import ShippingStrategySelector, {
    createShippingStrategySelectorFactory,
    ShippingStrategySelectorFactory,
} from './shipping-strategy-selector';
import { DEFAULT_STATE } from './shipping-strategy-state';

describe('ShippingStrategySelector', () => {
    let createShippingStrategySelector: ShippingStrategySelectorFactory;
    let selector: ShippingStrategySelector;
    let state: any;

    beforeEach(() => {
        createShippingStrategySelector = createShippingStrategySelectorFactory();
        state = {
            shippingStrategy: DEFAULT_STATE,
        };
    });

    describe('#getUpdateAddressError()', () => {
        it('returns error if unable to update address', () => {
            const updateAddressError = getErrorResponse();

            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { updateAddressError },
            });

            expect(selector.getUpdateAddressError()).toEqual(updateAddressError);
        });

        it('does not returns error if able to update address', () => {
            selector = createShippingStrategySelector(state.shippingStrategy);

            expect(selector.getUpdateAddressError()).toBeUndefined();
        });
    });

    describe('#getSelectOptionError()', () => {
        it('returns error if unable to select option', () => {
            const selectOptionError = getErrorResponse();

            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { selectOptionError },
            });

            expect(selector.getSelectOptionError()).toEqual(selectOptionError);
        });

        it('does not returns error if able to select option', () => {
            selector = createShippingStrategySelector(state.shippingStrategy);

            expect(selector.getSelectOptionError()).toBeUndefined();
        });
    });

    describe('#getInitializeError()', () => {
        it('returns error if unable to initialize any method', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError('foobar')).toEqual(getErrorResponse());
            expect(selector.getInitializeError('bar')).toBeUndefined();
        });

        it('does not return error if able to initialize', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                errors: {},
            });

            expect(selector.getInitializeError()).toBeUndefined();
        });
    });

    describe('#getWidgetInteractingError()', () => {
        it('returns error if widget interaction failed', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                errors: {
                    widgetInteractionError: getErrorResponse(),
                    widgetInteractionMethodId: 'foobar',
                },
            });

            expect(selector.getWidgetInteractionError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError('foobar')).toEqual(getErrorResponse());
            expect(selector.getInitializeError('bar')).toBeUndefined();
        });

        it('does not return error if able to initialize', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                errors: {},
            });

            expect(selector.getInitializeError()).toBeUndefined();
        });
    });

    describe('#isUpdatingAddress()', () => {
        it('returns true if updating address', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { isUpdatingAddress: true },
            });

            expect(selector.isUpdatingAddress()).toBe(true);
        });

        it('returns false if not updating address', () => {
            selector = createShippingStrategySelector(state.shippingStrategy);

            expect(selector.isUpdatingAddress()).toBe(false);
        });
    });

    describe('#isSelectingOption()', () => {
        it('returns true if selecting option', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { isSelectingOption: true },
            });

            expect(selector.isSelectingOption()).toBe(true);
        });

        it('returns false if not selecting option', () => {
            selector = createShippingStrategySelector(state.shippingStrategy);

            expect(selector.isSelectingOption()).toBe(false);
        });
    });

    describe('#isInitializing()', () => {
        it('returns true if initializing any method', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing()).toBe(true);
        });

        it('returns true if initializing specific method', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing('foobar')).toBe(true);
            expect(selector.isInitializing('bar')).toBe(false);
        });

        it('returns false if not initializing method', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { initializeMethodId: undefined, isInitializing: false },
            });

            expect(selector.isInitializing()).toBe(false);
        });
    });

    describe('#isInitialized()', () => {
        it('returns true if method is initialized', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                data: { foobar: { isInitialized: true } },
            });

            expect(selector.isInitialized('foobar')).toBe(true);
        });

        it('returns false if method is not initialized', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                data: { foobar: { isInitialized: false } },
            });

            expect(selector.isInitialized('foobar')).toBe(false);
            expect(selector.isInitialized('bar')).toBe(false);
        });
    });

    describe('#isWidgetInteracting()', () => {
        it('returns true if any method is interacting with a widget', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { widgetInteractionMethodId: 'foobar', isWidgetInteracting: true },
            });

            expect(selector.isWidgetInteracting()).toBe(true);
        });

        it('returns true if a specific method is interacting with a widget', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { widgetInteractionMethodId: 'foobar', isWidgetInteracting: true },
            });

            expect(selector.isWidgetInteracting('foobar')).toBe(true);
            expect(selector.isWidgetInteracting('bar')).toBe(false);
        });

        it('returns false if not interacting with a widget', () => {
            selector = createShippingStrategySelector({
                ...state.shippingStrategy,
                statuses: { widgetInteractionMethodId: undefined, isWidgetInteracting: false },
            });

            expect(selector.isWidgetInteracting()).toBe(false);
        });
    });
});
