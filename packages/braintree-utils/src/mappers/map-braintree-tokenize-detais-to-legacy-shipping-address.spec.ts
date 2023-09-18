import mapBraintreeTokenizeDetailsToLegacyShippingAddress from './map-braintree-tokenize-detais-to-legacy-shipping-address';

describe('#mapBraintreeTokenizeDetailsToLegacyShippingAddress()', () => {
    const detailsMock = {
        email: 'test@test.com',
        phone: '55555555555',
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

    it('maps details to legacy shipping address', () => {
        const props = {
            ...detailsMock,
            billingAddress: undefined,
        };

        const expects = {
            email: detailsMock.email,
            first_name: 'John',
            last_name: 'Doe',
            phone_number: detailsMock.phone,
            address_line_1: detailsMock.shippingAddress.line1,
            address_line_2: detailsMock.shippingAddress.line2,
            city: detailsMock.shippingAddress.city,
            state: detailsMock.shippingAddress.state,
            country_code: detailsMock.shippingAddress.countryCode,
            postal_code: detailsMock.shippingAddress.postalCode,
        };

        expect(mapBraintreeTokenizeDetailsToLegacyShippingAddress(props)).toEqual(expects);
    });
});
