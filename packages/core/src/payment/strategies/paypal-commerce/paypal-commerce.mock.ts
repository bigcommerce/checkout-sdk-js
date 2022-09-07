import { PaypalCommerceSDK } from './paypal-commerce-sdk';

export function getPaypalCommerceMock(): PaypalCommerceSDK {
    return {
        Messages: () => ({
            render: jest.fn(),
        }),
        PaymentFields: () => ({
            render: jest.fn(),
        }),
        FUNDING: {
            CARD: 'card',
            PAYPAL: 'paypal',
            CREDIT: 'credit',
            PAYLATER: 'paylater',
            BANCONTACT: 'Bancontact',
            GIROPAY: 'giropay',
            P24: 'p24',
            BLIK: 'blik',
            EPS: 'eps',
            IDEAL: 'ideal',
            MYBANK: 'mybank',
            OXXO: 'oxxo',
            SOFORT: 'sofort',
            TRUSTLY: 'trustly',
            SEPA: 'sepa',
            VERKKOPANKKI: 'verkkopankki',
            VENMO: 'venmo',
        },
        Buttons: () => ({
            render: jest.fn(),
            close: jest.fn(),
            isEligible: jest.fn(() => true),
        }),
        HostedFields: {
            isEligible: () => true,
            render: jest.fn(),
        },
    };
}
