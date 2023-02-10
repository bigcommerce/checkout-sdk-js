import { HostedFieldType } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function getBlueSnapPaymentInitializeOptionsMocks() {
    const ccCvvContainerId = 'ccCvv';
    const ccExpiryContainerId = 'ccExpiry';
    const ccNumberContainerId = 'ccNumber';
    const style = {
        color: 'rgb (51, 51, 51)',
        fontFamily: 'Montserrat, Arial, Helvetica, sans-serif',
        fontSize: '13px',
        fontWeight: '508',
    };

    return {
        ccCvvContainerId,
        ccExpiryContainerId,
        ccNumberContainerId,
        ccOptions: {
            form: {
                fields: {
                    [HostedFieldType.CardCode]: {
                        containerId: ccCvvContainerId,
                    },
                    [HostedFieldType.CardExpiry]: {
                        containerId: ccExpiryContainerId,
                    },
                    [HostedFieldType.CardName]: {
                        containerId: 'blueSnapDoesNotCare',
                    },
                    [HostedFieldType.CardNumber]: {
                        containerId: ccNumberContainerId,
                    },
                },
                styles: {
                    default: style,
                    error: style,
                    focus: style,
                },
                onBlur: jest.fn(),
                onCardTypeChange: jest.fn(),
                onEnter: jest.fn(),
                onFocus: jest.fn(),
                onValidate: jest.fn(),
            },
        },
    };
}
