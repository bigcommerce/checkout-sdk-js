import { PaypalCommerceSDK } from './paypal-commerce-sdk';

export function getPaypalCommerceMock(): PaypalCommerceSDK {
    return {
        FUNDING: {PAYPAL: ''},
        Buttons: () => ({render: jest.fn()}),
    };
}
