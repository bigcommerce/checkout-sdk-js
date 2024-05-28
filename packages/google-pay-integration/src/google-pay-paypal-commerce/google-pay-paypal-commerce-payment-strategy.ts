import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    InvalidArgumentError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayPaymentProcessor from '../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../google-pay-payment-strategy';
import { GooglePayInitializationData, GooglePayPayPalCommerceInitializationData } from '../types';

import PayPalCommerceScriptLoader from './google-pay-paypal-commerce-script-loader';
import { ConfirmOrderData, ConfirmOrderStatus } from './types';

export default class GooglePayPaypalCommercePaymentStrategy extends GooglePayPaymentStrategy {
    constructor(
        _paymentIntegrationService: PaymentIntegrationService,
        _googlePayPaymentProcessor: GooglePayPaymentProcessor,
        private _paypalCommerceScriptLoader: PayPalCommerceScriptLoader,
        private _requestSender: RequestSender,
    ) {
        super(_paymentIntegrationService, _googlePayPaymentProcessor);
    }

    async execute({ payment }: OrderRequestBody): Promise<void> {
        if (!payment?.methodId) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const state = this._paymentIntegrationService.getState();
        const cartId = state.getCartOrThrow().id;
        const { initializationData } = state.getPaymentMethodOrThrow<GooglePayInitializationData>(
            this._getMethodId(),
        );
        const { orderId } = await this.getOrderId(cartId);

        const { card_information } = initializationData || {};
        const nonce = await this._googlePayPaymentProcessor.getNonce(payment.methodId);

        const confirmOrderData = {
            tokenizationData: {
                type: 'PAYMENT_GATEWAY',
                token: atob(nonce),
            },
            info: {
                cardNetwork: card_information?.type || '',
                cardDetails: card_information?.number || '',
            },
            type: 'CARD',
        };

        await this.confirmOrder(orderId, confirmOrderData);
        await this._paymentIntegrationService.submitOrder();

        try {
            const paymentData = {
                formattedPayload: {
                    method_id: payment.methodId,
                    paypal_account: {
                        order_id: orderId,
                    },
                },
            };

            await this._paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
                paymentData,
            });
        } catch (error) {
            await this._googlePayPaymentProcessor.processAdditionalAction(error);
        }
    }

    private async confirmOrder(orderId: string, confirmOrderData: ConfirmOrderData) {
        const state = this._paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<GooglePayPayPalCommerceInitializationData>(
                this._getMethodId(),
            );

        const currencyCode = state.getCartOrThrow().currency.code;

        const payPalSDK = await this._paypalCommerceScriptLoader.getPayPalSDK(
            paymentMethod,
            currencyCode,
            true,
        );

        const { status } = await payPalSDK
            .Googlepay()
            .confirmOrder({ orderId, paymentMethodData: confirmOrderData });

        if (status === ConfirmOrderStatus.PayerActionRequired) {
            await payPalSDK.Googlepay().initiatePayerAction({ orderId });

            return Promise.resolve();
        }

        if (status !== ConfirmOrderStatus.Approved) {
            throw new InvalidArgumentError('Payment is not approved.');
        }

        return Promise.resolve();
    }

    private async getOrderId(cartId: string): Promise<{ orderId: string }> {
        const url = '/api/storefront/payments/googlepaypaypalcommercecheckout';
        const requestData = {
            cartId,
            shouldSaveInstrument: false,
        };

        const { body } = await this._requestSender.post<{ orderId: string }>(url, {
            headers: {
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                'Content-Type': ContentType.Json,
                ...SDK_VERSION_HEADERS,
            },
            body: requestData,
        });

        return body;
    }
}
