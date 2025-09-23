import * as customerStrategyFactories from '../generated/customer-strategies';
import * as paymentStrategyFactories from '../generated/payment-strategies';

import CheckoutService from './checkout-service';
import {
    CheckoutServiceOptions,
    createCheckoutServiceWithInternalOptions,
} from './create-checkout-service';

export default function createCheckoutServiceWithIntegrations(
    options?: CheckoutServiceOptions,
): CheckoutService {
    return createCheckoutServiceWithInternalOptions({
        ...options,
        integrations: {
            payment: paymentStrategyFactories,
            customer: customerStrategyFactories,
        },
    });
}
