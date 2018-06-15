import { getErrorResponse } from '../common/http-request/responses.mock';
import BillingAddressSelector from './billing-address-selector';
import { getBillingAddressState } from './billing-addresses.mock';

describe('BillingAddressSelector', () => {
    let billingAddressSelector;
    let state;

    beforeEach(() => {
        state = {
            billingAddress: getBillingAddressState(),
        };
    });

    describe('#getBillingAddress()', () => {
        it('returns the current billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress);

            expect(billingAddressSelector.getBillingAddress()).toEqual(state.billingAddress.data);
        });

        it('returns undefined if quote is not available', () => {
            billingAddressSelector = new BillingAddressSelector({ ...state.billingAddress, data: undefined });

            expect(billingAddressSelector.getBillingAddress()).toEqual();
        });
    });

    describe('#getUpdateError()', () => {
        it('returns error if unable to update', () => {
            const updateError = getErrorResponse();

            billingAddressSelector = new BillingAddressSelector({
                ...state.billingAddress,
                errors: { updateError },
            });

            expect(billingAddressSelector.getUpdateError()).toEqual(updateError);
        });

        it('does not returns error if able to update', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress);

            expect(billingAddressSelector.getUpdateError()).toBeUndefined();
        });
    });

    describe('#isUpdating()', () => {
        it('returns true if updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector({
                ...state.billingAddress,
                statuses: { isUpdating: true },
            });

            expect(billingAddressSelector.isUpdating()).toEqual(true);
        });

        it('returns false if not updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress);

            expect(billingAddressSelector.isUpdating()).toEqual(false);
        });
    });
});
