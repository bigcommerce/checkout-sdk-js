import { IframeEventPoster } from '../../common/iframe';
import { StorefrontStoredCardRequestSender } from '../../payment';
import { HostedFieldStoredCardRequestEvent } from '../hosted-field-events';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputValidator from './hosted-input-validator';

export default class HostedInputStoredCardHandler {
    constructor(
        private _inputAggregator: HostedInputAggregator,
        private _inputValidator: HostedInputValidator,
        private _eventPoster: IframeEventPoster<HostedInputEvent>,
        private _storedCardRequestSender: StorefrontStoredCardRequestSender,
    ) {}

    handle: (event: HostedFieldStoredCardRequestEvent) => Promise<void> = async (event) => {
        const {
            payload: { data, fields },
        } = event;
        const values = this._inputAggregator.getInputValues();
        const results = await this._inputValidator.validate(values);

        this._eventPoster.post({
            type: HostedInputEventType.Validated,
            payload: results,
        });

        if (!results.isValid) {
            return this._eventPoster.post({
                type: HostedInputEventType.StoredCardFailed,
            });
        }

        const { defaultInstrument, ...billingAddress } = fields;

        const [expiryMonth, expiryYear] = values.cardExpiry ? values.cardExpiry.split('/') : [];

        try {
            await this._storedCardRequestSender.submitPaymentInstrument(data, {
                billingAddress,
                instrument: {
                    type: 'card',
                    cardholderName: values.cardName || '',
                    number: values.cardNumber ? values.cardNumber.replace(/ /g, '') : '',
                    expiryMonth: Number(expiryMonth.trim()),
                    expiryYear: Number(`20${expiryYear.trim()}`),
                    verificationValue: values.cardCode ?? '',
                },
                defaultInstrument,
            });

            this._eventPoster.post({
                type: HostedInputEventType.StoredCardSucceeded,
            });
        } catch (error) {
            this._eventPoster.post({
                type: HostedInputEventType.StoredCardFailed,
            });
        }
    };
}
