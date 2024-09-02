import { Response } from '@bigcommerce/request-sender';
import { get, isString, snakeCase } from 'lodash';

import { IframeEventPoster } from '../common/iframe';
import { InvalidHostedFormValueError, PaymentErrorResponseBody } from '../errors';
import { HostedFieldSubmitManualOrderRequestEvent } from '../hosted-field-events';
import { ManualOrderPaymentRequestSender } from '../payment';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputStorage from './hosted-input-storage';
import HostedInputValidator from './hosted-input-validator';

export default class HostedInputManualOrderPaymentHandler {
    constructor(
        private _inputAggregator: HostedInputAggregator,
        private _inputValidator: HostedInputValidator,
        private _inputStorage: HostedInputStorage,
        private _eventPoster: IframeEventPoster<HostedInputEvent>,
        private _manualOrderPaymentRequestSender: ManualOrderPaymentRequestSender,
    ) {}

    handle: (event: HostedFieldSubmitManualOrderRequestEvent) => Promise<void> = async (event) => {
        const {
            payload: { data },
        } = event;
        const values = this._inputAggregator.getInputValues();
        const results = await this._inputValidator.validate(values);

        this._eventPoster.post({
            type: HostedInputEventType.Validated,
            payload: results,
        });

        if (!results.isValid) {
            const error = new InvalidHostedFormValueError(results.errors);

            return this._eventPoster.post({
                type: HostedInputEventType.SubmitManualOrderFailed,
                payload: {
                    error: { code: snakeCase(error.name), message: error.message },
                },
            });
        }

        try {
            const response = await this._manualOrderPaymentRequestSender.submitPayment(
                data,
                values,
                this._inputStorage.getNonce(),
            );

            const isFailure =
                get(response.body, 'type') === 'failure' && isString(get(response.body, 'code'));
            const isSuccess = get(response.body, 'type') === 'success';
            const isError = get(response.body, 'type') === 'error';

            if (isFailure) {
                this._eventPoster.post({
                    type: HostedInputEventType.SubmitManualOrderFailed,
                    payload: {
                        error: { code: get(response.body, 'code') },
                    },
                });
            } else if (isError) {
                this._eventPoster.post({
                    type: HostedInputEventType.SubmitManualOrderFailed,
                    payload: {
                        error: { code: get(response.body, 'type') },
                    },
                });
            } else if (isSuccess) {
                this._eventPoster.post({
                    type: HostedInputEventType.SubmitManualOrderSucceeded,
                });
            }
        } catch (error) {
            this._eventPoster.post({
                type: HostedInputEventType.SubmitManualOrderFailed,
                payload: this._isPaymentErrorResponse(error)
                    ? { error: error.body.errors[0], response: error }
                    : { error: { code: snakeCase(error.name), message: error.message } },
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
