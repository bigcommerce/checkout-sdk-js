import mapBraintreeTokenizeDetailsToLegacyBillingAddress from './map-braintree-tokenize-details-to-legacy-billing-address';

describe('mapBraintreeTokenizeDetailsToLegacyBillingAddress', () => {
    const detailsMock = {
        username: 'johndoe',
        email: 'test@test.com',
        payerId: '1122abc',
        firstName: 'John',
        lastName: 'Doe',
        countryCode: 'US',
        phone: '55555555555',
        billingAddress: {
            line1: 'billing_line1',
            line2: 'billing_line2',
            city: 'billing_city',
            state: 'billing_state',
            postalCode: '03444',
            countryCode: 'US',
        },
        shippingAddress: {
            recipientName: 'John Doe',
            line1: 'shipping_line1',
            line2: 'shipping_line2',
            city: 'shipping_city',
            state: 'shipping_state',
            postalCode: '03444',
            countryCode: 'US',
        },
    };

    it('maps details to legacy billing address using billing details as main address', () => {
        const props = detailsMock;

        const expects = {
            email: detailsMock.email,
            first_name: detailsMock.firstName,
            last_name: detailsMock.lastName,
            phone_number: detailsMock.phone,
            address_line_1: detailsMock.billingAddress.line1,
            address_line_2: detailsMock.billingAddress.line2,
            city: detailsMock.billingAddress.city,
            state: detailsMock.billingAddress.state,
            country_code: detailsMock.billingAddress.countryCode,
            postal_code: detailsMock.billingAddress.postalCode,
        };

        expect(mapBraintreeTokenizeDetailsToLegacyBillingAddress(props)).toEqual(expects);
    });

    it('maps details to legacy billing address using shipping details as main address if billing details is not provided', () => {
        const props = {
            ...detailsMock,
            billingAddress: undefined,
        };

        const expects = {
            email: detailsMock.email,
            first_name: detailsMock.firstName,
            last_name: detailsMock.lastName,
            phone_number: detailsMock.phone,
            address_line_1: detailsMock.shippingAddress.line1,
            address_line_2: detailsMock.shippingAddress.line2,
            city: detailsMock.shippingAddress.city,
            state: detailsMock.shippingAddress.state,
            country_code: detailsMock.shippingAddress.countryCode,
            postal_code: detailsMock.shippingAddress.postalCode,
        };

        expect(mapBraintreeTokenizeDetailsToLegacyBillingAddress(props)).toEqual(expects);
    });
});
