import {
    HostedFieldType,
    OrderRequestBody,
    PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getHostedFormInitializeOptions(): PaymentInitializeOptions {
    return {
        methodId: 'moneris',
        moneris: {
            containerId: 'moneris_iframe_container',
            form: {
                fields: {
                    [HostedFieldType.CardCodeVerification]: {
                        containerId: 'card-code-veridifaction',
                        instrumentId: 'instrument-id',
                    },
                    [HostedFieldType.CardNumberVerification]: {
                        containerId: 'card-number-verification',
                        instrumentId: 'instrument-id',
                    },
                },
            },
        },
    };
}

export function getOrderRequestBodyVaultedCC(): OrderRequestBody {
    return {
        useStoreCredit: false,
        payment: {
            methodId: 'moneris',
            paymentData: {
                shouldSaveInstrument: true,
                shouldSetAsDefaultInstrument: true,
                instrumentId: '1234',
            },
        },
    };
}
