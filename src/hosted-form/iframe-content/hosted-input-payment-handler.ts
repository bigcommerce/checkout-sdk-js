import { Response } from '@bigcommerce/request-sender';
import { snakeCase } from 'lodash';

import { PaymentErrorResponseBody } from '../../common/error';
import { IframeEventPoster } from '../../common/iframe';
import { PaymentRequestSender, PaymentRequestTransformer } from '../../payment';
import { InvalidHostedFormValueError } from '../errors';
import { HostedFieldSubmitRequestEvent } from '../hosted-field-events';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputValidator from './hosted-input-validator';

export default class HostedInputPaymentHandler {
    constructor(
        private _inputAggregator: HostedInputAggregator,
        private _inputValidator: HostedInputValidator,
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
            await this._paymentRequestSender.submitPayment(this._paymentRequestTransformer.transformWithHostedFormData(values, data));

            this._eventPoster.post({ type: HostedInputEventType.SubmitSucceeded });
        } catch (error) {
            this._eventPoster.post({
                type: HostedInputEventType.SubmitFailed,
                payload: {
                    error: this._isPaymentErrorResponse(error) ?
                        error.body.errors[0] :
                        { code: snakeCase(error.name), message: error.message },
                },
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
