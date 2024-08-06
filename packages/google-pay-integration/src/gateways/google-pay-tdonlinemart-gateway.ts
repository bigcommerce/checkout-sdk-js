import { FormPoster } from '@bigcommerce/form-poster';

import {
    getBrowserInfo,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { isTdOnlineMartAdditionalAction } from '../guards/is-google-pay-td-online-mart-additional-action';
import { ExtraPaymentData, TdOnlineMartThreeDSErrorBody } from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayTdOnlineMartGateway extends GooglePayGateway {
    constructor(service: PaymentIntegrationService, private formPoster: FormPoster) {
        super('worldlinena', service);
    }

    async extraPaymentData(): Promise<undefined | ExtraPaymentData> {
        return Promise.resolve({ browser_info: getBrowserInfo() });
    }

    async processAdditionalAction(error: unknown): Promise<void> {
        if (!isTdOnlineMartAdditionalAction(error)) {
            throw error;
        }

        const { three_ds_result: threeDSResult }: TdOnlineMartThreeDSErrorBody = error.body;
        const {
            acs_url: formUrl,
            payer_auth_request: threeDSSessionData,
            merchant_data: creq,
        } = threeDSResult || {};

        if (!formUrl || !threeDSSessionData || !creq) {
            throw new PaymentArgumentInvalidError(['formUrl', 'threeDSSessionData', 'creq']);
        }

        return new Promise((resolve) => {
            this.formPoster.postForm(
                formUrl,
                {
                    threeDSSessionData,
                    creq,
                },
                resolve,
                '_top',
            );
        });
    }
}
