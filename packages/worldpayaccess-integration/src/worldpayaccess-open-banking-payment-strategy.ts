import {
    isHostedInstrumentLike,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WorldpayAccessRedirectResponse } from './worldpayaccess-payment-options';

export default class WorldpayAccessOpenBankingPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute({ payment }: OrderRequestBody): Promise<void> {
        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        await this._paymentIntegrationService.submitOrder();

        try {
            if (this._isWorldpayAccessOpenBankingPayment(payment)) {
                await this._executeWorldpayAccessOpenBankingPayment(payment);
            } else {
                await this._executeWorldpayAccessCreditCardPayment(payment);
            }
        } catch (error) {
            if (this._isWorldpayAccessRedirectResponse(error)) {
                const redirectUrl = error.body.additional_action_required.data.redirect_url;

                return new Promise(() => window.location.replace(redirectUrl));
            }

            return Promise.reject(error);
        }
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private async _executeWorldpayAccessOpenBankingPayment(
        payment: OrderPaymentRequestBody,
    ): Promise<void> {
        await this._paymentIntegrationService.submitPayment(
            this._buildOpenBankingSubmitPayment(payment),
        );
    }

    private async _executeWorldpayAccessCreditCardPayment(
        payment: OrderPaymentRequestBody,
    ): Promise<void> {
        await this._paymentIntegrationService.submitPayment(payment);
    }

    private _buildOpenBankingSubmitPayment(payment: OrderPaymentRequestBody): Payment {
        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(
            payment.paymentData,
        )
            ? payment.paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        return {
            ...payment,
            paymentData: {
                formattedPayload: {
                    open_banking: {},
                    vault_payment_instrument: shouldSaveInstrument || false,
                    set_as_default_stored_instrument: shouldSetAsDefaultInstrument || false,
                },
            },
        };
    }

    private _isWorldpayAccessOpenBankingPayment(payment: OrderPaymentRequestBody): boolean {
        return payment.gatewayId === 'worldpayaccess' && payment.methodId === 'open_banking';
    }

    private _isWorldpayAccessRedirectResponse(
        response: unknown,
    ): response is WorldpayAccessRedirectResponse {
        if (typeof response !== 'object' || response === null) {
            return false;
        }

        const partialResponse = response as Partial<WorldpayAccessRedirectResponse>;

        if (!partialResponse.body) {
            return false;
        }

        const partialBody = partialResponse.body as {
            status?: string;
            additional_action_required?: {
                data?: { redirect_url?: string };
            };
        };

        return (
            partialBody.status === 'additional_action_required' &&
            !!partialBody.additional_action_required?.data?.redirect_url
        );
    }
}
