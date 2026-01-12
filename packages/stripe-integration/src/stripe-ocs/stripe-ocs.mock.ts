import {
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithStripeOCSPaymentInitializeOptions } from './stripe-ocs-initialize-options';

const gatewayId = 'stripeocs';
const methodId = 'optymized_checkout';

export const defaultAccordionLayout: Record<string, string | number | boolean> = {
    defaultCollapsed: false,
    radios: true,
    spacedAccordionItems: false,
    type: 'accordion',
    visibleAccordionItemsCount: 0,
};
export const defaultAccordionStyles: Record<string, string | number> = { fieldText: '#ccc' };

export function getStripeOCSMock(method = methodId): PaymentMethod {
    return {
        id: method,
        skipRedirectConfirmationAlert: true,
        gateway: gatewayId,
        logoUrl: '',
        method,
        supportedCards: [],
        config: {
            displayName: 'Stripe',
            merchantId: '',
            testMode: true,
        },
        initializationData: {
            stripePublishableKey: 'key',
            stripeConnectedAccount: 'key',
            browserLanguageEnabled: false,
            shopperLanguage: 'en',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        returnUrl: 'http://www.example.com',
    };
}

export function getStripeOCSInitializeOptionsMock(
    appearance = defaultAccordionStyles,
): PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions {
    return {
        methodId,
        gatewayId,
        [gatewayId]: {
            containerId: `${gatewayId}-${methodId}-component-field`,
            layout: defaultAccordionLayout,
            appearance,
            render: jest.fn(),
        },
    };
}

export function getStripeOCSOrderRequestBodyMock(
    stripePaymentMethodType = methodId,
): OrderRequestBody {
    return {
        payment: {
            methodId: stripePaymentMethodType,
            gatewayId,
        },
    };
}
