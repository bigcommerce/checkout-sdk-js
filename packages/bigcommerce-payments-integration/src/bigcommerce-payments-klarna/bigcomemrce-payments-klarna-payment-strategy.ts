import { isRedirectError } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';

import BigCommercePaymentsKlarnaPaymentInitializeOptions, {
    WithBigCommercePaymentsKlarnaPaymentInitializeOptions,
} from './bigcomemrce-payments-klarna-payment-initialize-options';

export default class BigCommercePaymentsKlarnaPaymentStrategy implements PaymentStrategy {
    private bigCommercePaymentsAlternativeMethods?: BigCommercePaymentsKlarnaPaymentInitializeOptions;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService,
    ) {}

    initialize(
        options: PaymentInitializeOptions & WithBigCommercePaymentsKlarnaPaymentInitializeOptions,
    ): Promise<void> {
        const { gatewayId, methodId, bigcommerce_payments_apms } = options;

        this.bigCommercePaymentsAlternativeMethods = bigcommerce_payments_apms;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.gatewayId" argument is not provided.',
            );
        }

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, gatewayId } = payment;

        try {
            const orderId = await this.bigCommercePaymentsIntegrationService.createOrder(
                'bigcommerce_payments_apms',
                {
                    gatewayId: 'bigcommerce_payments_apms',
                    methodId: 'klarna',
                },
            );

            const paymentData = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: methodId,
                    paypal_account: {
                        order_id: orderId,
                    },
                },
            };

            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment({
                methodId,
                gatewayId,
                paymentData,
            });
        } catch (error: unknown) {
            if (isRedirectError(error)) {
                const redirectUrl = error.body.additional_action_required.data.redirect_url;

                return new Promise((_, reject) => {
                    window.location.replace(redirectUrl);

                    reject();
                });
            }

            this.handleError(error);

            return Promise.reject(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private handleError(error: unknown) {
        const { onError } = this.bigCommercePaymentsAlternativeMethods || {};

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }
}
