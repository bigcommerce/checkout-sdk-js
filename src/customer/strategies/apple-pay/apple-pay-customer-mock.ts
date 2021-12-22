import { CustomerInitializeOptions } from '../../customer-request-options';

export function getApplePayCustomerInitializationOptions(): CustomerInitializeOptions {
    return {
        applepay: {
            container: 'applePayCheckoutButton',
            shippingLabel: 'Shipping',
            subtotalLabel: 'Subtotal',
            onPaymentAuthorize: jest.fn(),
            onError: jest.fn(),
        },
    };
}
