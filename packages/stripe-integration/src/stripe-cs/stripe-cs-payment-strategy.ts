/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    StripeIntegrationService,
    StripeScriptLoader,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import { WithStripeCSPaymentInitializeOptions } from './stripe-cs-initialize-options';

export default class StripeOCSPaymentStrategy implements PaymentStrategy {
    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _scriptLoader: StripeScriptLoader,
        private _stripeIntegrationService: StripeIntegrationService,
    ) {}

    async initialize(
        _options: PaymentInitializeOptions & WithStripeCSPaymentInitializeOptions,
    ): Promise<void> {
        return Promise.resolve();
    }

    async execute(
        _orderRequest: OrderRequestBody,
        _options?: PaymentRequestOptions,
    ): Promise<void> {
        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }
}
