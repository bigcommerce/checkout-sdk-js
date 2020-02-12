import { PaypalCommerceSDK } from './paypalCommerce-sdk';

export function getPaypalCommerceMock(): PaypalCommerceSDK {
    return {
        Buttons: () => ({render: jest.fn()}),
    };
}
