import { FormPoster } from '@bigcommerce/form-poster';
import { some } from 'lodash';

import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    isRequestError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStatusTypes,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class ConvergePaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        paymentIntegrationService: PaymentIntegrationService,
        protected formPoster: FormPoster,
    ) {
        super(paymentIntegrationService);
    }
    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        try {
            await super.execute(payload, options);
        } catch (error) {
            if (
                !isRequestError(error) ||
                !some(error.body.errors, { code: 'three_d_secure_required' })
            ) {
                return Promise.reject(error);
            }

            return new Promise(() => {
                this.formPoster.postForm(error.body.three_ds_result.acs_url, {
                    PaReq: error.body.three_ds_result.payer_auth_request,
                    TermUrl: error.body.three_ds_result.callback_url,
                    MD: error.body.three_ds_result.merchant_data,
                });
            });
        }
    }

    async finalize(options?: PaymentRequestOptions): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const order = state.getOrder();

        if (order && state.getPaymentStatus() === PaymentStatusTypes.FINALIZE) {
            await this._paymentIntegrationService.finalizeOrder(options);

            return;
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }
}
