import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithStripeUPEPaymentInitializeOptions } from './stripe-upe-initialize-options';

const gatewayId = 'stripeupe';
const methodId = 'stripe_ocs';

export const defaultAccordionLayout: Record<string, string | number | boolean> = {
    defaultCollapsed: false,
    radios: true,
    spacedAccordionItems: false,
    type: 'accordion',
    visibleAccordionItemsCount: 0,
};
export const defaultAccordionStyles: Record<string, string | number> = { fieldText: '#ccc' };

export function getStripeOCSInitializeOptionsMock(
    style = defaultAccordionStyles,
): PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions {
    return {
        methodId,
        gatewayId,
        [gatewayId]: {
            containerId: `${gatewayId}-${methodId}-component-field`,
            layout: defaultAccordionLayout,
            style,
            render: jest.fn(),
        },
    };
}
