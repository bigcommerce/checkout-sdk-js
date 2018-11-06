import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import BillingAddressSelector from './billing-address-selector';

describe('BillingAddressSelector', () => {
    let billingAddressSelector: BillingAddressSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        state = getCheckoutStoreState();
    });

    describe('#getBillingAddress()', () => {
        it('returns the current billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress);

            expect(billingAddressSelector.getBillingAddress()).toEqual(state.billingAddress.data);
        });

        it('returns undefined if quote is not available', () => {
            billingAddressSelector = new BillingAddressSelector({ ...state.billingAddress, data: undefined });

            expect(billingAddressSelector.getBillingAddress()).toBeFalsy();
        });
    });

    describe('#getUpdateError()', () => {
        it('returns error if unable to update', () => {
            const updateError = new Error();

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

    describe('#getContinueAsGuestError()', () => {
        it('returns error if unable to update', () => {
            const continueAsGuestError = new Error();

            billingAddressSelector = new BillingAddressSelector({
                ...state.billingAddress,
                errors: { continueAsGuestError },
            });

            expect(billingAddressSelector.getContinueAsGuestError()).toEqual(continueAsGuestError);
        });

        it('does not returns error if able to update', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress);

            expect(billingAddressSelector.getContinueAsGuestError()).toBeUndefined();
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

    describe('#isContinuingAsGuest()', () => {
        it('returns true if updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector({
                ...state.billingAddress,
                statuses: { isContinuingAsGuest: true },
            });

            expect(billingAddressSelector.isContinuingAsGuest()).toEqual(true);
        });

        it('returns false if not updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress);

            expect(billingAddressSelector.isContinuingAsGuest()).toEqual(false);
        });
    });
});
