import { merge } from 'lodash';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { getFlatRateOption, getShippingOptionsState } from './internal-shipping-options.mock';
import { getQuoteState } from '../quote/internal-quotes.mock';
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
            const loadError = getErrorResponse();

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
});
