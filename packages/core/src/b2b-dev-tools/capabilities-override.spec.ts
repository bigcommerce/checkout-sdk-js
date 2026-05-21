// TODO: CHECKOUT-9979 remove this file before delivery
import { Capabilities } from '../config/capabilities';

import { applyCapabilitiesOverride } from './capabilities-override';

describe('applyCapabilitiesOverride', () => {
    const originalLocation = window.location;

    function setSearch(search: string): void {
        delete (window as { location?: Location }).location;
        (window as { location: Pick<Location, 'search'> }).location = { search };
    }

    function baseCapabilities(): Capabilities {
        return {
            userJourney: {
                disableEditCart: false,
                disableStoreCredit: false,
                hasCompanyAddressBook: false,
                hasAddressExtraFields: false,
                requiresB2BToken: false,
            },
            customer: { superAdminCompanySelector: false },
            shipping: {
                restrictManualAddressEntry: false,
                prefillCompanyAddress: false,
                hideSaveToAddressBookCheck: false,
                hideBillingSameAsShippingCheck: false,
            },
            billing: {
                restrictManualAddressEntry: false,
                hideSaveToAddressBookCheck: false,
            },
            payment: {
                paymentMethodFiltering: false,
                b2bPaymentMethodFilter: false,
                poPaymentMethod: false,
                additionalPaymentNotes: false,
                excludeOfflineForInvoice: false,
                excludePPSDK: false,
            },
            orderConfirmation: {
                orderSummary: false,
                persistB2BMetadata: false,
                storeQuoteId: false,
                storeInvoiceReference: false,
                invoiceRedirect: false,
            },
        };
    }

    afterEach(() => {
        delete (window as { location?: Location }).location;
        (window as { location: Location }).location = originalLocation;
    });

    it('returns the input unchanged when no override is present', () => {
        setSearch('');

        const input = baseCapabilities();

        expect(applyCapabilitiesOverride(input)).toBe(input);
    });

    it('returns undefined when input is undefined and no override is present', () => {
        setSearch('');

        expect(applyCapabilitiesOverride(undefined)).toBeUndefined();
    });

    it('merges a payment override over the base capabilities', () => {
        const override = encodeURIComponent(
            JSON.stringify({ payment: { b2bPaymentMethodFilter: true } }),
        );

        setSearch(`?capabilitiesOverride=${override}`);

        const input = baseCapabilities();
        const result = applyCapabilitiesOverride(input);

        expect(result?.payment.b2bPaymentMethodFilter).toBe(true);
        expect(result?.payment.paymentMethodFiltering).toBe(false);
        expect(result?.userJourney).toEqual(input.userJourney);
    });

    it('merges multiple groups in one override', () => {
        const override = encodeURIComponent(
            JSON.stringify({
                payment: { b2bPaymentMethodFilter: true },
                orderConfirmation: { invoiceRedirect: true },
            }),
        );

        setSearch(`?capabilitiesOverride=${override}`);

        const result = applyCapabilitiesOverride(baseCapabilities());

        expect(result?.payment.b2bPaymentMethodFilter).toBe(true);
        expect(result?.orderConfirmation.invoiceRedirect).toBe(true);
    });

    it('produces an override-only result when the input is undefined', () => {
        const override = encodeURIComponent(
            JSON.stringify({ payment: { b2bPaymentMethodFilter: true } }),
        );

        setSearch(`?capabilitiesOverride=${override}`);

        const result = applyCapabilitiesOverride(undefined);

        expect(result?.payment.b2bPaymentMethodFilter).toBe(true);
    });

    it('falls back to the input when the override is malformed JSON', () => {
        setSearch('?capabilitiesOverride=not-json');

        const input = baseCapabilities();

        expect(applyCapabilitiesOverride(input)).toBe(input);
    });

    it('falls back to the input when the override is a non-object JSON value', () => {
        setSearch('?capabilitiesOverride=42');

        const input = baseCapabilities();

        expect(applyCapabilitiesOverride(input)).toBe(input);
    });

    it('falls back to the input when the override is a JSON array', () => {
        setSearch('?capabilitiesOverride=%5B1%2C2%5D');

        const input = baseCapabilities();

        expect(applyCapabilitiesOverride(input)).toBe(input);
    });
});
