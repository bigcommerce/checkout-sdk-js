import { noop, without } from 'lodash';

import { IframeEventListener } from '../common/iframe';
import { OrderPaymentRequestBody } from '../order';

import { InvalidHostedFormConfigError } from './errors';
import HostedField from './hosted-field';
import HostedFieldType from './hosted-field-type';
import HostedFormOptions from './hosted-form-options';
import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';
import { HostedInputEventMap, HostedInputEventType } from './iframe-content';

type HostedFormEventCallbacks = Pick<HostedFormOptions, 'onBlur' | 'onCardTypeChange' | 'onFocus' | 'onValidateError'>;

export default class HostedForm {
    constructor(
        private _fields: HostedField[],
        private _eventListener: IframeEventListener<HostedInputEventMap>,
        private _payloadTransformer: HostedFormOrderDataTransformer,
        eventCallbacks: HostedFormEventCallbacks
    ) {
        const { onBlur = noop, onCardTypeChange = noop, onFocus = noop, onValidateError: onValidateError = noop } = eventCallbacks;

        this._eventListener.addListener(HostedInputEventType.Blurred, ({ payload }) => onBlur(payload));
        this._eventListener.addListener(HostedInputEventType.CardTypeChanged, ({ payload }) => onCardTypeChange(payload));
        this._eventListener.addListener(HostedInputEventType.Focused, ({ payload }) => onFocus(payload));
        this._eventListener.addListener(HostedInputEventType.ValidateFailed, ({ payload }) => onValidateError(payload));
    }

    async attach(): Promise<void> {
        this._eventListener.listen();

        const numberField = this._getNumberField();
        const otherFields = without(this._fields, numberField);

        await numberField.attach();
        await Promise.all(otherFields.map(field => field.attach()));
    }

    detach(): void {
        this._eventListener.stopListen();

        this._fields.forEach(field => {
            field.detach();
        });
    }

    async submit(payload: OrderPaymentRequestBody): Promise<void> {
        return await this._getNumberField().submit(
            this._fields.map(field => field.getType()),
            this._payloadTransformer.transform(payload)
        );
    }

    private _getNumberField(): HostedField {
        const numberField = this._fields.find(field =>
            field.getType() === HostedFieldType.CardNumber
        );

        if (!numberField) {
            throw new InvalidHostedFormConfigError('Unable to proceed because the credit card number field is not defined.');
        }

        return numberField;
    }
}
