import { isRequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Response } from '@bigcommerce/request-sender';
import { snakeCase } from 'lodash';

import { PaymentErrorResponseBody } from '../../common/error';
import { IframeEventPoster } from '../../common/iframe';
import { PaymentRequestSender, PaymentRequestTransformer } from '../../payment';
import { InvalidHostedFormValueError } from '../errors';
import { HostedFieldSubmitRequestEvent } from '../hosted-field-events';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType, HostedInputSubmitErrorEvent } from './hosted-input-events';
import HostedInputStorage from './hosted-input-storage';
import HostedInputValidator from './hosted-input-validator';

export default class HostedInputPaymentHandler {
    constructor(
        private _inputAggregator: HostedInputAggregator,
        private _inputValidator: HostedInputValidator,
        private _inputStorage: HostedInputStorage,
        private _eventPoster: IframeEventPoster<HostedInputEvent>,
        private _paymentRequestSender: PaymentRequestSender,
        private _paymentRequestTransformer: PaymentRequestTransformer
    ) {}

    handle: (event: HostedFieldSubmitRequestEvent) => Promise<void> = async ({ payload: { data } }) => {
        const values = this._inputAggregator.getInputValues();
        const results = await this._inputValidator.validate(values);

        this._eventPoster.post({
            type: HostedInputEventType.Validated,
            payload: results,
        });

        if (!results.isValid) {
            const error = new InvalidHostedFormValueError(results.errors);

            return this._eventPoster.post({
                type: HostedInputEventType.SubmitFailed,
                payload: {
                    error: { code: snakeCase(error.name), message: error.message },
                },
            });
        }

        try {
            const response = await this._paymentRequestSender.submitPayment(
                this._paymentRequestTransformer.transformWithHostedFormData(
                    values,
                    data,
                    this._inputStorage.getNonce() || ''
                )
            );

            this._eventPoster.post({
                type: HostedInputEventType.SubmitSucceeded,
                payload: { response },
            });
        } catch (error) {
            let payload: HostedInputSubmitErrorEvent['payload'];
            
            if (this._isPaymentErrorResponse(error)) {
                payload = { error: error.body.errors[0], response: error };
            } else if ((error instanceof Error)) {
                payload = { error: { code: snakeCase(error.name), message: error.message } };
            } else {
                payload = { error: { code: 'unknown' } };
            }

            this._eventPoster.post({
                type: HostedInputEventType.SubmitFailed,
                payload,
            });
        }
    };

    private _isPaymentErrorResponse(response: any): response is Response<PaymentErrorResponseBody> {
        const { body: { errors = [] } = {} } = response || {};

        return (
            typeof (errors[0] && errors[0].code) === 'string' &&
            typeof (errors[0] && errors[0].message) === 'string'
        );
    }
}
