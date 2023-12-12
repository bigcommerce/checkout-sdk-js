import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isAdditionalActionRedirect from '../utils/is-additional-action-redirect';
import assertBlueSnapDirectIdealInstrument from '../utils/is-bluesnap-direct-ideal-instrument';

export default class BlueSnapDirectIdealPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    async execute({ payment }: OrderRequestBody): Promise<void> {
        assertBlueSnapDirectIdealInstrument(payment?.paymentData);

        await this._paymentIntegrationService.submitOrder();

        try {
            await this._paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: {
                    formattedPayload: {
                        ideal: {
                            bic: payment.paymentData.bic,
                            // language: 'en',
                        },
                    },
                },
            });
        } catch (error) {
            if (isAdditionalActionRedirect(error)) {
                const additionalActionRequired = error.body.additional_action_required;

                return window.location.replace(additionalActionRequired.data.redirect_url);
            }

            return Promise.reject(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }
}
