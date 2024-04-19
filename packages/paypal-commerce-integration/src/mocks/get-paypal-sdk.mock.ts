import { PayPalSDK } from '../paypal-commerce-types';

const cardFieldMethodsMock = {
    render: jest.fn(),
    clear: jest.fn(),
    close: jest.fn(),
    removeClass: jest.fn(),
};

export default function getPayPalSDKMock(): PayPalSDK {
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
            OXXO: 'oxxo',
            SEPA: 'sepa',
            VENMO: 'venmo',
        },
        Buttons: () => ({
            render: jest.fn(),
            close: jest.fn(),
            isEligible: jest.fn(() => true),
        }),
        CardFields: () =>
            Promise.resolve({
                isEligible: () => true,
                CVVField: jest.fn().mockReturnValue(cardFieldMethodsMock),
                ExpiryField: jest.fn().mockReturnValue(cardFieldMethodsMock),
                NameField: jest.fn().mockReturnValue(cardFieldMethodsMock),
                NumberField: jest.fn().mockReturnValue(cardFieldMethodsMock),
                submit: jest.fn().mockReturnValue(Promise.resolve()),
                getState: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ fields: { number: { isValid: true } } })),
            }),
        HostedFields: {
            isEligible: () => true,
            render: jest.fn(),
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Legal: () => ({
            render: jest.fn(),
        }),
    };
}
