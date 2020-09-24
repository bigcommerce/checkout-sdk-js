import { NotImplementedError, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import { ButtonsOptions, DataPaypalCommerceScript, ParamsForProvider, PaypalButtonStyleOptions, PaypalCommerceButtons, PaypalCommerceHostedFields, PaypalCommerceHostedFieldsApprove, PaypalCommerceHostedFieldsRenderOptions, PaypalCommerceHostedFieldsState, PaypalCommerceHostedFieldsSubmitOptions, PaypalCommerceMessages, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceSDK, PaypalCommerceSDKFunding, StyleButtonColor, StyleButtonLabel, StyleButtonLayout, StyleButtonShape } from './index';

export interface OptionalParamsRenderButtons {
    paramsForProvider?: ParamsForProvider;
    fundingKey?: keyof PaypalCommerceSDKFunding;
    onRenderButton?(): void;
}

export interface ParamsRenderHostedFields {
    fields: PaypalCommerceHostedFieldsRenderOptions['fields'];
    styles?: PaypalCommerceHostedFieldsRenderOptions['styles'];
}

interface EventsHostedFields {
    blur?(event: PaypalCommerceHostedFieldsState): void;
    focus?(event: PaypalCommerceHostedFieldsState): void;
    cardTypeChange?(event: PaypalCommerceHostedFieldsState): void;
    validityChange?(event: PaypalCommerceHostedFieldsState): void;
    inputSubmitRequest?(event: PaypalCommerceHostedFieldsState): void;
}

export default class PaypalCommercePaymentProcessor {
    private _paypal?: PaypalCommerceSDK;
    private _paypalButtons?: PaypalCommerceButtons;
    private _paypalMessages?: PaypalCommerceMessages;
    private _hostedFields?: PaypalCommerceHostedFields;
    private _fundingSource?: string;

    constructor(
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender
    ) {}

    async initialize(paramsScript: DataPaypalCommerceScript, isProgressiveOnboardingAvailable?: boolean): Promise<PaypalCommerceSDK> {
        this._paypal = await this._paypalScriptLoader.loadPaypalCommerce(paramsScript, isProgressiveOnboardingAvailable);

        return this._paypal;
    }

    renderButtons(cartId: string, container: string, params: ButtonsOptions = {}, optionalParams: OptionalParamsRenderButtons = {}): PaypalCommerceButtons {
        if (!this._paypal || !this._paypal.Buttons) {
            throw new PaymentMethodClientUnavailableError();
        }

        const { paramsForProvider, fundingKey, onRenderButton } = optionalParams;

        const buttonParams: ButtonsOptions = {
            ...params,
            createOrder: () => this._setupPayment(cartId, paramsForProvider),
            onClick: data => {
                this._fundingSource = data.fundingSource;

                params.onClick?.(data);
            },
        };

        if (params.style) {
            buttonParams.style = this._validateStyleParams(params.style);
        }

        if (fundingKey) {
            this._fundingSource = this._paypal.FUNDING[fundingKey];
            buttonParams.fundingSource = this._fundingSource;
        }

        this._paypalButtons = this._paypal.Buttons(buttonParams);

        if (!this._paypalButtons.isEligible()) {
            throw new NotImplementedError(`PayPal ${this._fundingSource || ''} is not available for your region. Please use PayPal Checkout instead.`);
        }

        onRenderButton?.();

        this._paypalButtons.render(container);

        return this._paypalButtons;
    }

    renderMessages(cartTotal: number, container: string): PaypalCommerceMessages {
        if (!this._paypal || !this._paypal.Messages) {
            throw new PaymentMethodClientUnavailableError();
        }
        this._paypalMessages = this._paypal.Messages({
            amount: cartTotal,
            placement: 'cart',
            style: {
                layout: 'text',
            },
        });
        this._paypalMessages.render(container);

        return this._paypalMessages;
    }

    async renderHostedFields(cartId: string, params: ParamsRenderHostedFields, events?: EventsHostedFields): Promise<void> {
        if (!this._paypal || !this._paypal.HostedFields) {
            throw new PaymentMethodClientUnavailableError();
        }

        const { fields, styles } = params;

        if (!this._paypal.HostedFields.isEligible()) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._hostedFields = await this._paypal.HostedFields.render({
            fields,
            styles,
            paymentsSDK: true,
            createOrder: () => this._setupPayment(cartId, { isCreditCard: true }),
        });

        if (events) {
            (Object.keys(events) as Array<keyof EventsHostedFields>).forEach(key => {
                (this._hostedFields as PaypalCommerceHostedFields).on(key, events[key] as (event: PaypalCommerceHostedFieldsState) => void);
            });
        }
    }

    async submitHostedFields(is3dsEnabled?: boolean): Promise<PaypalCommerceHostedFieldsApprove> {
        if (!this._hostedFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const options: PaypalCommerceHostedFieldsSubmitOptions = {};

        if (is3dsEnabled) {
            options.contingencies = ['3D_SECURE'];
        }

        return this._hostedFields.submit(options);
    }

    deinitialize() {
        this._paypalButtons?.close();

        this._paypal = undefined;
        this._paypalButtons = undefined;
        this._fundingSource = undefined;
        this._hostedFields = undefined;
    }

    private async _setupPayment(cartId: string, params: ParamsForProvider = {}): Promise<string> {
        const paramsForProvider = { ...params, isCredit: this._fundingSource === 'credit' };
        const { orderId } = await this._paypalCommerceRequestSender.setupPayment(cartId, paramsForProvider);

        return orderId;
    }

    private _validateStyleParams = (style: PaypalButtonStyleOptions): PaypalButtonStyleOptions  => {
        const updatedStyle: PaypalButtonStyleOptions = { ...style };
        const { label, color, layout, shape, height, tagline } = style;

        if (label && !StyleButtonLabel[label]) {
            delete updatedStyle.label;
        }

        if (layout && !StyleButtonLayout[layout]) {
            delete updatedStyle.layout;
        }

        if (color && !StyleButtonColor[color]) {
            delete updatedStyle.color;
        }

        if (shape && !StyleButtonShape[shape]) {
            delete updatedStyle.shape;
        }

        if (typeof height === 'number') {
            updatedStyle.height = height < 25
                ? 25
                : (height > 55 ? 55 : height);
        } else {
            delete updatedStyle.height;
        }

        if (typeof tagline !== 'boolean' || (tagline && updatedStyle.layout !== StyleButtonLayout[StyleButtonLayout.horizontal])) {
            delete updatedStyle.tagline;
        }

        return updatedStyle;
    };

}
