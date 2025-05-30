import { GooglePayConfig } from '../types';

export default function googlePayConfigMock(): GooglePayConfig {
    return {
        allowedPaymentMethods: [
            {
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MASTERCARD'],
                    billingAddressParameters: { format: 'FULL' },
                    billingAddressRequired: true,
                    assuranceDetailsRequired: false,
                },
                tokenizationSpecification: {
                    parameters: {
                        gateway: 'paypalppcp',
                        gatewayMerchantId: 'ID',
                    },
                    type: 'PAYMENT_GATEWAY',
                },
                type: 'CARD',
            },
        ],
        apiVersion: 2,
        apiVersionMinor: 2,
        countryCode: 'US',
        isEligible: true,
        merchantInfo: {
            merchantId: 'id',
            merchantOrigin: 'origin',
        },
    };
}
