import { BillingAddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import getPayPalOrderDetails from './mocks/get-paypal-order-details.mock';
import {
    addressesRegionallyCompatible,
    buildMergedShippingAddressForBackfill,
    mergeShippingAddressForBackfill,
    orderHasAdditionalLineFillVsQuote,
    shouldBackfillShippingAddress,
    tryGetShippingAddressFromOrderDetails,
} from './paypal-shipping-address-backfill';
import { PayPalOrderDetails } from './paypal-types';

describe('paypal-shipping-address-backfill', () => {
    const partialQuote: BillingAddressRequestBody = {
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        address1: '',
        address2: '',
        city: 'New York',
        countryCode: 'US',
        postalCode: '10065',
        stateOrProvince: '',
        stateOrProvinceCode: 'NY',
        phone: '',
        customFields: [],
    };

    describe('tryGetShippingAddressFromOrderDetails', () => {
        it('returns undefined when purchase_units shipping is missing', () => {
            const details: PayPalOrderDetails = {
                payer: getPayPalOrderDetails().payer,
                purchase_units: [{} as PayPalOrderDetails['purchase_units'][0]],
            };

            expect(tryGetShippingAddressFromOrderDetails(details)).toBeUndefined();
        });

        it('returns address when shipping block is complete', () => {
            const result = tryGetShippingAddressFromOrderDetails(getPayPalOrderDetails());

            expect(result).toMatchObject({
                firstName: 'Full',
                lastName: 'Name',
                countryCode: 'US',
                stateOrProvinceCode: 'NY',
            });
        });
    });

    describe('addressesRegionallyCompatible', () => {
        it('returns true when country and overlapping regional fields match', () => {
            const order = tryGetShippingAddressFromOrderDetails(getPayPalOrderDetails())!;

            expect(addressesRegionallyCompatible(partialQuote, order)).toBe(true);
        });

        it('returns false when country differs', () => {
            const order: BillingAddressRequestBody = {
                ...partialQuote,
                countryCode: 'CA',
            };

            expect(addressesRegionallyCompatible(partialQuote, order)).toBe(false);
        });
    });

    describe('orderHasAdditionalLineFillVsQuote', () => {
        it('returns true when order fills address1 quote lacks', () => {
            const order: BillingAddressRequestBody = {
                ...partialQuote,
                address1: '2 E 61st St',
            };

            expect(orderHasAdditionalLineFillVsQuote(partialQuote, order)).toBe(true);
        });

        it('returns false when quote already has address1', () => {
            const fullQuote = { ...partialQuote, address1: '1 Main' };
            const order: BillingAddressRequestBody = {
                ...partialQuote,
                address1: '2 E 61st St',
            };

            expect(orderHasAdditionalLineFillVsQuote(fullQuote, order)).toBe(false);
        });
    });

    describe('shouldBackfillShippingAddress', () => {
        it('returns true when region matches and order has fuller lines', () => {
            expect(shouldBackfillShippingAddress(partialQuote, getPayPalOrderDetails())).toBe(true);
        });

        it('returns false when regions do not match', () => {
            const wrongRegion: BillingAddressRequestBody = {
                ...partialQuote,
                stateOrProvinceCode: 'CA',
            };

            expect(shouldBackfillShippingAddress(wrongRegion, getPayPalOrderDetails())).toBe(false);
        });
    });

    describe('mergeShippingAddressForBackfill', () => {
        it('fills blank quote fields from order', () => {
            const order = tryGetShippingAddressFromOrderDetails(getPayPalOrderDetails())!;

            const merged = mergeShippingAddressForBackfill(partialQuote, order);

            expect(merged.address1).toBe(order.address1);
            expect(merged.city).toBe(partialQuote.city);
        });
    });

    describe('buildMergedShippingAddressForBackfill', () => {
        it('returns merged address from order details', () => {
            const merged = buildMergedShippingAddressForBackfill(
                partialQuote,
                getPayPalOrderDetails(),
            );

            expect(merged.address1).toBe('2 E 61st St');
        });
    });
});
