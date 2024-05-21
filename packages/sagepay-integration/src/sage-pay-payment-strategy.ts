import { FormPoster } from '@bigcommerce/form-poster';
import { some } from 'lodash';

import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    getBrowserInfo,
    isRequestError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStatusTypes,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class SagePayPaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private _formPoster: FormPoster,
    ) {
        super(paymentIntegrationService);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment } = payload;

        if (!payment) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { paymentData } = payment;

        if (!paymentData) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        if (this._isThreeDSTwoExperimentOn()) {
            const newPaymentData = {
                ...paymentData,
                browser_info: getBrowserInfo(),
            };

            if (payload.payment) {
                payload.payment.paymentData = newPaymentData;
            }
        }

        return super.execute(payload, options).catch((error: Error) => {
            if (
                !isRequestError(error) ||
                !some(error.body.errors, { code: 'three_d_secure_required' })
            ) {
                return Promise.reject(error);
            }

            return new Promise(() => {
                let payload;

                if (this._isThreeDSTwoExperimentOn() && !error.body.three_ds_result.merchant_data) {
                    payload = {
                        creq: error.body.three_ds_result.payer_auth_request,
                    };
                } else {
                    payload = {
                        PaReq: error.body.three_ds_result.payer_auth_request,
                        TermUrl: error.body.three_ds_result.callback_url,
                        MD: error.body.three_ds_result.merchant_data,
                    };
                }

                this._formPoster.postForm(
                    error.body.three_ds_result.acs_url,
                    payload,
                    undefined,
                    '_top',
                );
            });
        });
    }

    finalize(options?: PaymentRequestOptions): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const order = state.getOrder();

        if (order && state.getPaymentStatus() === PaymentStatusTypes.FINALIZE) {
            this.paymentIntegrationService.finalizeOrder(options);
        }

        return super.finalize();
    }

    private _isThreeDSTwoExperimentOn(): boolean {
        return (
            this.paymentIntegrationService.getState().getStoreConfigOrThrow().checkoutSettings
                .features['INT-4994.Opayo_3DS2'] === true
        );
    }
}
