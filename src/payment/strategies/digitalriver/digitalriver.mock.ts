import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions } from '../../payment-request-options';

import DigitalRiverJS, { DigitalRiverInitializeToken } from './digitalriver';

export function getDigitalRiverJSMock(): DigitalRiverJS {
    return {
        createDropin: jest.fn(() => {
            return {
                mount: jest.fn(),
            };
        }),
        authenticateSource: jest.fn(),
    };
}

export function getInitializeOptionsMock(): PaymentInitializeOptions {
    return {
        digitalriver: {
            containerId: 'drop-in',
            configuration: {
                button: {
                    type: 'submitOrder',
                },
                flow: 'checkout',
                showComplianceSection: true,
                showSavePaymentAgreement: false,
                showTermsOfSaleDisclosure: true,
                usage: 'unscheduled',
            },
            onError: jest.fn(),
            onRenderButton: jest.fn(),
            onSubmitForm: jest.fn(),
        },
        gatewayId: '',
        methodId: 'digitalriver',
    };
}

export function getClientMock(): DigitalRiverInitializeToken {
    return {
        sessionId: '1234',
        checkoutId: '12345676543',
    };
}

export function getDigitalRiverInitializationDataMock() {
    return {
        publicKey: '1234',
        paymentLanguage: 'en-US',
    };

}

export function getDigitalRiverPaymentMethodMock(): PaymentMethod {
    return {
        id: 'digitalriver',
        logoUrl: '',
        method: 'digitalriver',
        supportedCards: [],
        config: {
            testMode: true,
        },
        initializationData: getDigitalRiverInitializationDataMock(),
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
    };
}
