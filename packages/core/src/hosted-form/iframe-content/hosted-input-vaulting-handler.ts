import { IframeEventPoster } from '../../common/iframe';
import { StorefrontVaultingRequestSender } from '../../payment';
import { HostedFieldVaultingRequestEvent } from '../hosted-field-events';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputValidator from './hosted-input-validator';

export default class HostedInputVaultingHandler {
    constructor(
        private _inputAggregator: HostedInputAggregator,
        private _inputValidator: HostedInputValidator,
        private _eventPoster: IframeEventPoster<HostedInputEvent>,
        private _vaultingRequestSender: StorefrontVaultingRequestSender,
    ) {}

    handle: (event: HostedFieldVaultingRequestEvent) => Promise<void> = async (event) => {
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
                type: HostedInputEventType.VaultingFailed,
            });
        }

        const { default_instrument, ...billingAddress } = fields;

        const [expiry_month, expiry_year] = values.cardExpiry ? values.cardExpiry.split('/') : [];

        try {
            await this._vaultingRequestSender.submitPaymentMethod(data, {
                billingAddress,
                instrument: {
                    type: 'card',
                    cardholder_name: values.cardName || '',
                    number: values.cardNumber ? values.cardNumber.replace(/ /g, '') : '',
                    expiry_month: Number(expiry_month.trim()),
                    expiry_year: Number(`20${expiry_year.trim()}`),
                    verification_value: values.cardCode ?? '',
                },
                default_instrument,
            });

            this._eventPoster.post({
                type: HostedInputEventType.VaultingSucceeded,
            });
        } catch (error) {
            this._eventPoster.post({
                type: HostedInputEventType.VaultingFailed,
            });
        }
    };
}
