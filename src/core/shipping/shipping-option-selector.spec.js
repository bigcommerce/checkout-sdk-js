import { merge } from 'lodash';
import { getErrorResponseBody } from '../common/http-request/responses.mock';
import { getFlatRateOption, getShippingOptionsState } from './shipping-options.mock';
import { getQuoteState } from '../quote/quotes.mock';
import ShippingOptionSelector from './shipping-option-selector';

describe('ShippingOptionSelector', () => {
    let shippingOptionSelector;
    let state;

    beforeEach(() => {
        state = {
            shippingOptions: getShippingOptionsState(),
            quote: getQuoteState(),
        };
    });

    describe('#getShippingOptions()', () => {
        it('returns the current shipping options', () => {
            shippingOptionSelector = new ShippingOptionSelector(state.shippingOptions, state.quote);

            expect(shippingOptionSelector.getShippingOptions()).toEqual(state.shippingOptions.data);
        });
    });

    describe('#getSelectedShippingOption()', () => {
        it('returns selected shipping option', () => {
            shippingOptionSelector = new ShippingOptionSelector(state.shippingOptions, state.quote);

            expect(shippingOptionSelector.getSelectedShippingOption()).toEqual(getFlatRateOption());
        });

        it('returns undefined if shipping option is not selected', () => {
            shippingOptionSelector = new ShippingOptionSelector(state.shippingOptions, merge({}, state.quote, {
                data: {
                    shippingOption: '',
                },
            }));

            expect(shippingOptionSelector.getSelectedShippingOption()).toEqual();
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponseBody();

            shippingOptionSelector = new ShippingOptionSelector({
                ...state.shippingOptions,
                errors: { loadError },
            }, state.quote);

            expect(shippingOptionSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            shippingOptionSelector = new ShippingOptionSelector(state.shippingOptions, state.quote);

            expect(shippingOptionSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#getSelectError()', () => {
        it('returns error if unable to select', () => {
            const selectError = getErrorResponseBody();

            shippingOptionSelector = new ShippingOptionSelector({
                ...state.shippingOptions,
                errors: { selectError },
            }, state.quote);

            expect(shippingOptionSelector.getSelectError()).toEqual(selectError);
        });

        it('does not returns error if able to select', () => {
            shippingOptionSelector = new ShippingOptionSelector(state.shippingOptions, state.quote);

            expect(shippingOptionSelector.getSelectError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading shipping options', () => {
            shippingOptionSelector = new ShippingOptionSelector({
                ...state.shippingOptions,
                statuses: { isLoading: true },
            });

            expect(shippingOptionSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading shipping options', () => {
            shippingOptionSelector = new ShippingOptionSelector(state.shippingOptions, state.quote);

            expect(shippingOptionSelector.isLoading()).toEqual(false);
        });
    });

    describe('#isSelecting()', () => {
        it('returns true if selecting shipping options', () => {
            shippingOptionSelector = new ShippingOptionSelector({
                ...state.shippingOptions,
                statuses: { isSelecting: true },
            }, state.quote);

            expect(shippingOptionSelector.isSelecting()).toEqual(true);
        });

        it('returns false if not selecting shipping options', () => {
            shippingOptionSelector = new ShippingOptionSelector(state.shippingOptions, state.quote);

            expect(shippingOptionSelector.isSelecting()).toEqual(false);
        });
    });
});
