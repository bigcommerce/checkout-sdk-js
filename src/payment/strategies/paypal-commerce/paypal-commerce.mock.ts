import { PaypalCommerceSDK } from './paypal-commerce-sdk';

export function getPaypalCommerceMock(): PaypalCommerceSDK {
    return {
        Buttons: () => ({render: jest.fn()}),
    };
}
