import { noop, without } from 'lodash';

import { IframeEventListener } from '../common/iframe';
import { OrderPaymentRequestBody } from '../order';

import { InvalidHostedFormConfigError } from './errors';
import HostedField from './hosted-field';
import HostedFormOptions from './hosted-form-options';
import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';
import { HostedInputEnterEvent, HostedInputEventMap, HostedInputEventType } from './iframe-content';

type HostedFormEventCallbacks = Pick<HostedFormOptions, 'onBlur' | 'onCardTypeChange' | 'onFocus' | 'onEnter' | 'onValidate'>;

export default class HostedForm {
    private _bin?: string;
    private _cardType?: string;

    constructor(
        private _fields: HostedField[],
        private _eventListener: IframeEventListener<HostedInputEventMap>,
        private _payloadTransformer: HostedFormOrderDataTransformer,
        private _eventCallbacks: HostedFormEventCallbacks
    ) {
        const { onBlur = noop, onCardTypeChange = noop, onFocus = noop, onValidate = noop } = this._eventCallbacks;

        this._eventListener.addListener(HostedInputEventType.Blurred, ({ payload }) => onBlur(payload));
        this._eventListener.addListener(HostedInputEventType.CardTypeChanged, ({ payload }) => onCardTypeChange(payload));
        this._eventListener.addListener(HostedInputEventType.Focused, ({ payload }) => onFocus(payload));
        this._eventListener.addListener(HostedInputEventType.Validated, ({ payload }) => onValidate(payload));
        this._eventListener.addListener(HostedInputEventType.Entered, this._handleEnter);

        this._eventListener.addListener(HostedInputEventType.CardTypeChanged, ({ payload }) => this._cardType = payload.cardType);
        this._eventListener.addListener(HostedInputEventType.BinChanged, ({ payload }) => this._bin = payload.bin);
    }

    getBin(): string | undefined {
        return this._bin;
    }

    getCardType(): string | undefined {
        return this._cardType;
    }

    async attach(): Promise<void> {
        this._eventListener.listen();

        const field = this._getFirstField();
        const otherFields = without(this._fields, field);

        await field.attach();
        await Promise.all(otherFields.map(otherField => otherField.attach()));
    }

    detach(): void {
        this._eventListener.stopListen();

        this._fields.forEach(field => {
            field.detach();
        });
    }

    async submit(payload: OrderPaymentRequestBody): Promise<void> {
        return await this._getFirstField().submitForm(
            this._fields.map(field => field.getType()),
            this._payloadTransformer.transform(payload)
        );
    }

    async validate(): Promise<void> {
        return await this._getFirstField().validateForm();
    }

    private _getFirstField(): HostedField {
        const field = this._fields[0];

        if (!field) {
            throw new InvalidHostedFormConfigError('Unable to proceed because the payment form has no field defined.');
        }

        return field;
    }

    private _handleEnter: (event: HostedInputEnterEvent) => Promise<void> = async ({ payload }) => {
        try {
            await this.validate();
        } catch (error) {
            // Catch form validation error because we want to trigger `onEnter`
            // irrespective of the validation result.
            if (error.name !== 'InvalidHostedFormValueError') {
                throw error;
            }
        }

        const { onEnter = noop } = this._eventCallbacks;

        onEnter(payload);
    };
}
