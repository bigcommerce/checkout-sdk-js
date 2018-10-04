import { getErrorResponse } from '../common/http-request/responses.mock';
import { CountrySelector } from '../geography';
import { getCountriesState } from '../geography/countries.mock';

import BillingAddressSelector from './billing-address-selector';
import { getBillingAddressState } from './billing-addresses.mock';

describe('BillingAddressSelector', () => {
    let billingAddressSelector;
    let countrySelector;
    let state;

    beforeEach(() => {
        state = {
            billingAddress: getBillingAddressState(),
        };

        countrySelector = new CountrySelector(getCountriesState());
    });

    describe('#getBillingAddress()', () => {
        it('returns the current billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress, countrySelector);

            expect(billingAddressSelector.getBillingAddress()).toEqual(state.billingAddress.data);
        });

        it('returns undefined if quote is not available', () => {
            billingAddressSelector = new BillingAddressSelector({ ...state.billingAddress, data: undefined }, countrySelector);

            expect(billingAddressSelector.getBillingAddress()).toEqual();
        });
    });

    describe('#getUpdateError()', () => {
        it('returns error if unable to update', () => {
            const updateError = getErrorResponse();

            billingAddressSelector = new BillingAddressSelector({
                ...state.billingAddress,
                errors: { updateError },
            }, countrySelector);

            expect(billingAddressSelector.getUpdateError()).toEqual(updateError);
        });

        it('does not returns error if able to update', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress, countrySelector);

            expect(billingAddressSelector.getUpdateError()).toBeUndefined();
        });
    });

    describe('#getContinueAsGuestError()', () => {
        it('returns error if unable to update', () => {
            const continueAsGuestError = getErrorResponse();


            billingAddressSelector = new BillingAddressSelector({
                ...state.billingAddress,
                errors: { continueAsGuestError },
            }, countrySelector);

            expect(billingAddressSelector.getContinueAsGuestError()).toEqual(continueAsGuestError);
        });

        it('does not returns error if able to update', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress, countrySelector);

            expect(billingAddressSelector.getContinueAsGuestError()).toBeUndefined();
        });
    });

    describe('#isUpdating()', () => {
        it('returns true if updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector({
                ...state.billingAddress,
                statuses: { isUpdating: true },
            }, countrySelector);

            expect(billingAddressSelector.isUpdating()).toEqual(true);
        });

        it('returns false if not updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress, countrySelector);

            expect(billingAddressSelector.isUpdating()).toEqual(false);
        });
    });

    describe('#isContinuingAsGuest()', () => {
        it('returns true if updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector({
                ...state.billingAddress,
                statuses: { isContinuingAsGuest: true },
            }, countrySelector);

            expect(billingAddressSelector.isContinuingAsGuest()).toEqual(true);
        });

        it('returns false if not updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.billingAddress, countrySelector);

            expect(billingAddressSelector.isContinuingAsGuest()).toEqual(false);
        });
    });
});
