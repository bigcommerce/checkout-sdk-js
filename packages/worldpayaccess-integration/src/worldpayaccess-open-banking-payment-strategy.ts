import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    WorldpayAccessOpenBankingInstrument,
    WorldpayAccessRedirectResponse,
} from './worldpayaccess-payment-options';

function isWorldpayAccessOpenBankingInstrument(
    paymentData: unknown,
): paymentData is WorldpayAccessOpenBankingInstrument {
    if (typeof paymentData !== 'object' || paymentData === null) {
        return false;
    }

    const data = paymentData as Record<string, unknown>;

    return typeof data.bankCode === 'string';
}

export default class WorldpayAccessOpenBankingPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute(payload: OrderRequestBody): Promise<void> {
        const paymentPayload = this._formatPaymentPayload(payload);

        console.log({ paymentPayload });

        await this._paymentIntegrationService.submitOrder();

        try {
            await this._paymentIntegrationService.submitPayment(paymentPayload);
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

    private _formatPaymentPayload({ payment }: OrderRequestBody) {
        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!payment.paymentData || !isWorldpayAccessOpenBankingInstrument(payment.paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        return {
            methodId: payment.methodId,
            gatewayId: payment.gatewayId || 'worldpayaccess',
            paymentData: {
                formattedPayload: {
                    open_banking: {
                        bank_code: payment.paymentData.bankCode,
                    },
                },
            },
        };
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

        const partialBody = partialResponse.body;

        return (
            partialBody.status === 'additional_action_required' &&
            !!partialBody.additional_action_required?.data?.redirect_url
        );
    }
}
