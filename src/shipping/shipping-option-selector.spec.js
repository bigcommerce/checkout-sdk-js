import { getErrorResponse } from '../common/http-request/responses.mock';
import { getFlatRateOption, getShippingOptions } from './internal-shipping-options.mock';
import ShippingOptionSelector from './shipping-option-selector';
import { getConsignment, getConsignmentsState } from './consignments.mock';

describe('ShippingOptionSelector', () => {
    let shippingOptionSelector;
    let state;

    beforeEach(() => {
        state = {
            consignments: getConsignmentsState(),
        };

        shippingOptionSelector = new ShippingOptionSelector(state.consignments);
    });

    describe('#getShippingOptions()', () => {
        it('returns the current shipping options', () => {
            expect(shippingOptionSelector.getShippingOptions()).toEqual(getShippingOptions());
        });
    });

    describe('#getSelectedShippingOption()', () => {
        it('returns selected shipping option', () => {
            expect(shippingOptionSelector.getSelectedShippingOption()).toEqual(getFlatRateOption());
        });

        it('returns undefined if shipping option is not selected', () => {
            const consignmentState = {
                data: [{
                    ...getConsignment(),
                    selectedShippingOptionId: undefined,
                }],
            };

            shippingOptionSelector = new ShippingOptionSelector(consignmentState);

            expect(shippingOptionSelector.getSelectedShippingOption()).toBeFalsy();
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponse();

            shippingOptionSelector = new ShippingOptionSelector({
                data: [],
                errors: { loadError },
            });

            expect(shippingOptionSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            expect(shippingOptionSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading shipping options', () => {
            shippingOptionSelector = new ShippingOptionSelector({
                data: [],
                statuses: { isLoading: true },
            });

            expect(shippingOptionSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading shipping options', () => {
            expect(shippingOptionSelector.isLoading()).toEqual(false);
        });
    });
});
