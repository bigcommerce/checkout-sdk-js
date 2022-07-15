import { isNil, omitBy } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { NotImplementedError, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator } from '../../../order';
import { PaymentMethod } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentStrategyType from '../../payment-strategy-type';

import { ButtonsOptions, FieldsOptions, NON_INSTANT_PAYMENT_METHODS, ParamsForProvider, PaypalButtonStyleOptions, PaypalCommerceButtons, PaypalCommerceFields, PaypalCommerceHostedFields, PaypalCommerceHostedFieldsApprove, PaypalCommerceHostedFieldsRenderOptions, PaypalCommerceHostedFieldsState, PaypalCommerceHostedFieldsSubmitOptions, PaypalCommerceInitializationData, PaypalCommerceMessages, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceSDK, PaypalCommerceSDKFunding, PaypalFieldsStyleOptions, ShippingChangeData, StyleButtonColor, StyleButtonLabel, StyleButtonLayout, StyleButtonShape } from "./index";

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

export interface RenderApmFieldsParams {
    apmFieldsContainer: string;
    fundingKey: keyof PaypalCommerceSDKFunding;
    apmFieldsStyles?: PaypalFieldsStyleOptions;
    fullName?: string;
    email?: string;
}

export default class PaypalCommercePaymentProcessor {
    private _paypal?: PaypalCommerceSDK;
    private _paypalButtons?: PaypalCommerceButtons;
    private _paypalFields?: PaypalCommerceFields;
    private _paypalMessages?: PaypalCommerceMessages;
    private _hostedFields?: PaypalCommerceHostedFields;
    private _fundingSource?: string;
    private _orderId?: string;
    private _gatewayId?: string;
    private _isVenmoEnabled?: boolean;

    constructor(
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    async initialize(paymentMethod: PaymentMethod<PaypalCommerceInitializationData>, currencyCode: string, initializesOnCheckoutPage?: boolean): Promise<PaypalCommerceSDK> {
        this._paypal = await this._paypalScriptLoader.loadPaypalCommerce(paymentMethod, currencyCode, initializesOnCheckoutPage);
        this._gatewayId = paymentMethod.gateway;
        this._isVenmoEnabled = paymentMethod.initializationData?.isVenmoEnabled;

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

            onClick: async (data, actions) => {
                this._fundingSource = data.fundingSource;

                return params.onClick?.(data, actions);
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
            this._processNotEligible(buttonParams, fundingKey);
        }

        onRenderButton?.();

        this._paypalButtons.render(container);

        return this._paypalButtons;
    }

    renderFields({ apmFieldsContainer, fundingKey, apmFieldsStyles, fullName, email }: RenderApmFieldsParams): PaypalCommerceFields {
        if (!this._paypal || !this._paypal.PaymentFields) {
            throw new PaymentMethodClientUnavailableError();
        }

        const fieldsParams: FieldsOptions = {
            fundingSource: this._paypal.FUNDING[fundingKey],
            style: apmFieldsStyles,
            fields: {
                name: {
                    value: fullName,
                },
                email: {
                    value: email,
                },
            },
        };

        this._paypalFields = this._paypal.PaymentFields(fieldsParams);

        const fieldContainerElement = document.querySelector(apmFieldsContainer);
        if (fieldContainerElement) {
            fieldContainerElement.innerHTML = '';
        }

        this._paypalFields.render(apmFieldsContainer);

        return this._paypalFields;
    }

    getOrderId() {
        return this._orderId;
    }

    async setShippingOptions(payload: ShippingChangeData) {
        return await this._paypalCommerceRequestSender.setShippingOptions(payload);
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

    async submitHostedFields(options?: PaypalCommerceHostedFieldsSubmitOptions): Promise<PaypalCommerceHostedFieldsApprove> {
        if (!this._hostedFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._hostedFields.submit(omitBy(options, isNil));
    }

    getHostedFieldsValidationState(): { isValid: boolean; fields: PaypalCommerceHostedFieldsState['fields'] } {
        if (!this._hostedFields) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { fields } = this._hostedFields.getState();

        const isValid = (Object.keys(fields) as Array<keyof PaypalCommerceHostedFieldsState['fields']>)
            .every(key => fields[key]?.isValid);

        return { isValid, fields };
    }

    deinitialize() {
        this._paypalButtons?.close?.();
        this._paypal = undefined;
        this._paypalButtons = undefined;
        this._fundingSource = undefined;
        this._hostedFields = undefined;
    }

    private async _setupPayment(cartId: string, params: ParamsForProvider = {}): Promise<string> {
        const paramsForProvider = { ...params, isCredit: this._fundingSource === 'credit' || this._fundingSource === 'paylater' };
        const isAPM = this._gatewayId === PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS;
        const isVenmo = this._fundingSource === 'venmo' && this._isVenmoEnabled;

        const { orderId } = await this._paypalCommerceRequestSender.setupPayment(cartId, {...paramsForProvider, isAPM, isVenmo});
        this._orderId = orderId;
        const methodId = this._fundingSource;

        if (methodId && NON_INSTANT_PAYMENT_METHODS.indexOf(methodId) > -1) {
            await this._patchNonInstantPaymentMethods(methodId);
        }

        return orderId;
    }

    private async _patchNonInstantPaymentMethods(methodId: string): Promise<InternalCheckoutSelectors> {
        const gatewayId = this._gatewayId;
        const paymentData =  {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: null,
                method_id: methodId,
                paypal_account: {
                    order_id: this._orderId,
                },
            },
        };

        const order = { useStoreCredit: false };
        const paymentRequestOptions = {
            gatewayId,
            methodId,
        };

        await this._store.dispatch(this._orderActionCreator.submitOrder(
            order,
            { params: paymentRequestOptions }
        ));

        return this._store.dispatch(this._paymentActionCreator.submitPayment({
            gatewayId,
            methodId,
            paymentData,
        }));
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

    private _processNotEligible(buttonParams: ButtonsOptions, fundingKey?: keyof PaypalCommerceSDKFunding): void {
        if (fundingKey?.toUpperCase() === this._paypal?.FUNDING.PAYLATER.toUpperCase()) {
            buttonParams.fundingSource = this._paypal?.FUNDING.CREDIT;

            this._paypalButtons = this._paypal?.Buttons(buttonParams);

            if (this._paypalButtons?.isEligible()) {
                return;
            }
        }

        throw new NotImplementedError(`PayPal ${this._fundingSource || ''} is not available for your region. Please use PayPal Checkout instead.`);
    }
}
