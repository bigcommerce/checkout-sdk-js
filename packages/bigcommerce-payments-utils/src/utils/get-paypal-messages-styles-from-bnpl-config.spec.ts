import getPaypalMessagesStylesFromBNPLConfig from './get-paypal-messages-styles-from-bnpl-config';

describe('getPaypalMessagesStylesFromBNPLConfig', () => {
    it('returns BigCommerce Messages Style Options from BNPL Config', () => {
        const input = {
            id: 'checkout',
            name: 'Checkout page',
            status: true,
            styles: {
                color: 'white-no-border',
                layout: 'text',
                'logo-type': 'alternative',
                'logo-position': 'right',
                ratio: '8x1',
                'text-color': 'white',
                'text-size': '10',
            },
        };

        const expectedOutput = {
            color: 'white-no-border',
            layout: 'text',
            logo: {
                type: 'alternative',
                position: 'right',
            },
            ratio: '8x1',
            text: {
                color: 'white',
                size: 10,
            },
        };

        expect(getPaypalMessagesStylesFromBNPLConfig(input)).toStrictEqual(expectedOutput);
    });
});
