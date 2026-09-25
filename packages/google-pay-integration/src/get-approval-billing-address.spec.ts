import {
    BillingAddress,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getApprovalBillingAddress from './get-approval-billing-address';

describe('getApprovalBillingAddress', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    // The mock's state is shared across tests, so stub a single call rather than the whole file.
    function givenBillingAddress(billingAddress: BillingAddress | undefined) {
        jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValueOnce(
            billingAddress,
        );
    }

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('maps the checkout billing address onto the Google Pay address shape', () => {
        givenBillingAddress(getBillingAddress());

        expect(getApprovalBillingAddress(paymentIntegrationService)).toEqual({
            name: 'Test Tester',
            address1: '12345 Testing Way',
            address2: '',
            address3: '',
            locality: 'Some City',
            administrativeArea: 'CA',
            countryCode: 'US',
            postalCode: '95555',
            sortingCode: '',
            phoneNumber: '555-555-5555',
        });
    });

    it('uses the first name alone when there is no last name', () => {
        givenBillingAddress({ ...getBillingAddress(), lastName: '' });

        expect(getApprovalBillingAddress(paymentIntegrationService)).toEqual(
            expect.objectContaining({ name: 'Test' }),
        );
    });

    it('leaves phoneNumber off rather than sending it blank', () => {
        givenBillingAddress({ ...getBillingAddress(), phone: '' });

        const billingAddress = getApprovalBillingAddress(paymentIntegrationService);

        expect(billingAddress).toBeDefined();
        expect(billingAddress).not.toHaveProperty('phoneNumber');
    });

    it('returns undefined when there is no billing address', () => {
        givenBillingAddress(undefined);

        expect(getApprovalBillingAddress(paymentIntegrationService)).toBeUndefined();
    });

    it('returns undefined when the name is only whitespace', () => {
        givenBillingAddress({ ...getBillingAddress(), firstName: ' ', lastName: '  ' });

        expect(getApprovalBillingAddress(paymentIntegrationService)).toBeUndefined();
    });

    // PayPal rejects the whole approve request if billing_address is present without a country
    // code, so a partial address must never be sent.
    it('returns undefined when there is no country code', () => {
        givenBillingAddress({ ...getBillingAddress(), countryCode: '' });

        expect(getApprovalBillingAddress(paymentIntegrationService)).toBeUndefined();
    });
});
