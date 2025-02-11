import mapToLegacyShippingAddress from './map-to-legacy-shipping-address';

describe('mapToLegacyShippingAddress()', () => {
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

        expect(mapToLegacyShippingAddress(props)).toEqual(expects);
    });

    it('should return only personal info when no shipping address is available', () => {
        const details = {
            email: 'noaddress@example.com',
            phone: '5555555555',
        };

        const result = mapToLegacyShippingAddress(details);
        expect(result).toEqual({
            email: 'noaddress@example.com',
            first_name: '',
            last_name: '',
            phone_number: '5555555555',
            address_line_1: undefined,
            address_line_2: undefined,
            city: undefined,
            state: undefined,
            country_code: undefined,
            postal_code: undefined,
        });
    });
});
