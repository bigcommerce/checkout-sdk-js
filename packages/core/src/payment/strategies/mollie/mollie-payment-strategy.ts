import { each, some } from 'lodash';

import { PaymentActionCreator } from '../..';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getBrowserInfo } from '../../../common/browser-info';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    RequestError,
} from '../../../common/error/errors';
import { HostedForm, HostedFormFactory, HostedFormOptions } from '../../../hosted-form';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { HostedInstrument } from '../../payment';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { MollieClient, MollieElement } from './mollie';
import MolliePaymentInitializeOptions from './mollie-initialize-options';
import MollieScriptLoader from './mollie-script-loader';

export enum MolliePaymentMethodType {
    creditcard = 'credit_card',
}

const methodsNotAllowedWhenDigitalOrder = ['klarnapaylater', 'klarnasliceit'];

export default class MolliePaymentStrategy implements PaymentStrategy {
    private _initializeOptions?: MolliePaymentInitializeOptions;
    private _mollieClient?: MollieClient;
    private _cardHolderElement?: MollieElement;
    private _cardNumberElement?: MollieElement;
    private _verificationCodeElement?: MollieElement;
    private _expiryDateElement?: MollieElement;
    private _locale?: string;

    private _hostedForm?: HostedForm;

    private _unsubscribe?: () => void;

    constructor(
        private _hostedFormFactory: HostedFormFactory,
        private _store: CheckoutStore,
        private _mollieScriptLoader: MollieScriptLoader,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { mollie, methodId, gatewayId } = options;

        if (!mollie) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.mollie" argument is not provided.',
            );
        }

        if (!methodId || !gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "methodId" and/or "gatewayId" argument is not provided.',
            );
        }

        const controllers = document.querySelectorAll('.mollie-components-controller');

        each(controllers, (controller) => controller.remove());

        const state = this._store.getState();
        const storeConfig = state.config.getStoreConfig();

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        this._initializeOptions = mollie;

        const paymentMethods = state.paymentMethods;
        const paymentMethod = paymentMethods.getPaymentMethodOrThrow(methodId, gatewayId);
        const {
            config: { merchantId, testMode },
        } = paymentMethod;
        const { locale } = paymentMethod.initializationData;

        this._locale = locale;

        if (!merchantId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "merchantId" argument is not provided.',
            );
        }

        if (
            this.isCreditCard(methodId) &&
            mollie.form &&
            this.shouldShowTSVHostedForm(methodId, gatewayId)
        ) {
            this._hostedForm = await this._mountCardVerificationfields(mollie.form);
        } else if (this.isCreditCard(methodId)) {
            this._mollieClient = await this._loadMollieJs(
                merchantId,
                storeConfig.storeProfile.storeLanguage,
                testMode,
            );
            this._mountElements();
        }

        this._unsubscribe = this._store.subscribe(
            async (state) => {
                const key = options.gatewayId
                    ? options.methodId + options.gatewayId
                    : options.methodId;

                if (state.paymentStrategies.isInitialized(key)) {
                    const element = document.getElementById(`${gatewayId}-${methodId}-paragraph`);

                    if (element) {
                        element.remove();
                    }

                    mollie.disableButton(false);

                    this._loadPaymentMethodsAllowed(mollie, methodId, gatewayId, state);
                }
            },
            (state) => {
                const checkout = state.checkout.getCheckout();

                return checkout && checkout.outstandingBalance;
            },
            (state) => {
                const checkout = state.checkout.getCheckout();

                return checkout && checkout.coupons;
            },
        );

        this._loadPaymentMethodsAllowed(mollie, methodId, gatewayId, state);

        return Promise.resolve(this._store.getState());
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment?.paymentData;

        if (!payment || !payment.gatewayId || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment', 'gatewayId', 'paymentData']);
        }

        try {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            if (isVaultedInstrument(paymentData)) {
                return await this.executeWithVaulted(payment);
            }

            if (this.isCreditCard(payment.methodId)) {
                return await this.executeWithCC(payment);
            }

            return await this.executeWithAPM(payment);
        } catch (error) {
            return this._processAdditionalAction(error);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        if (this._hostedForm) {
            this._hostedForm.detach();
        }

        if (options && options.methodId && options.gatewayId && !this._hostedForm) {
            const element = document.getElementById(`${options.gatewayId}-${options.methodId}`);

            if (element) {
                element.remove();
            }
        } else if (options && options.methodId && this.isCreditCard(options.methodId)) {
            if (
                this._cardHolderElement &&
                this._cardNumberElement &&
                this._verificationCodeElement &&
                this._expiryDateElement
            ) {
                this._cardHolderElement.unmount();
                this._cardHolderElement = undefined;

                this._cardNumberElement.unmount();
                this._cardNumberElement = undefined;

                this._verificationCodeElement.unmount();
                this._verificationCodeElement = undefined;

                this._expiryDateElement.unmount();
                this._expiryDateElement = undefined;
            }
        }

        this._mollieClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    protected async executeWithCC(
        payment: OrderPaymentRequestBody,
    ): Promise<InternalCheckoutSelectors> {
        const paymentData = payment.paymentData;
        const shouldSaveInstrument = (paymentData as HostedInstrument).shouldSaveInstrument;
        const shouldSetAsDefaultInstrument = (paymentData as HostedInstrument)
            .shouldSetAsDefaultInstrument;

        const { token, error } = await this._getMollieClient().createToken();

        if (error) {
            return Promise.reject(error);
        }

        const formattedPayload = {
            credit_card_token: {
                token,
            },
            vault_payment_instrument: shouldSaveInstrument,
            set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
            browser_info: getBrowserInfo(),
            shopper_locale: this._getShopperLocale(),
        };

        return this._store.dispatch(
            this._paymentActionCreator.submitPayment({
                ...payment,
                paymentData: {
                    formattedPayload,
                },
            }),
        );
    }

    protected async executeWithVaulted(
        payment: OrderPaymentRequestBody,
    ): Promise<InternalCheckoutSelectors> {
        if (this._isHostedPaymentFormEnabled(payment.methodId, payment.gatewayId)) {
            const form = this._hostedForm;

            if (!form) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            await form.validate();
            await form.submit(payment);

            return this._store.dispatch(this._orderActionCreator.loadCurrentOrder());
        }

        return this._store.dispatch(this._paymentActionCreator.submitPayment(payment));
    }

    protected async executeWithAPM(
        payment: OrderPaymentRequestBody,
    ): Promise<InternalCheckoutSelectors> {
        const paymentData = payment.paymentData;
        const issuer = paymentData && 'issuer' in paymentData ? paymentData.issuer : '';

        return this._store.dispatch(
            this._paymentActionCreator.submitPayment({
                ...payment,
                paymentData: {
                    ...paymentData,
                    formattedPayload: {
                        issuer,
                        shopper_locale: this._getShopperLocale(),
                    },
                },
            }),
        );
    }

    private isCreditCard(methodId: string): boolean {
        return methodId === MolliePaymentMethodType.creditcard;
    }

    private shouldShowTSVHostedForm(methodId: string, gatewayId: string): boolean {
        return (
            this._isHostedPaymentFormEnabled(methodId, gatewayId) && this._isHostedFieldAvailable()
        );
    }

    private _mountCardVerificationfields(formOptions: HostedFormOptions): Promise<HostedForm> {
        /* eslint-disable */
        return new Promise(async (resolve , reject) => {
            try {
                const { config } = this._store.getState();
                const bigpayBaseUrl = config.getStoreConfig()?.paymentSettings.bigpayBaseUrl;

                if (!bigpayBaseUrl) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                const form = this._hostedFormFactory.create(bigpayBaseUrl, formOptions);

                await form.attach();

                resolve(form);
            } catch (error) {
                reject(error);
            }
        });
    }

    private _isHostedPaymentFormEnabled(methodId: string, gatewayId?: string): boolean {
        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private _isHostedFieldAvailable(): boolean {
        const options = this._getInitializeOptions();

        return !!options.form?.fields;
    }

    private _processAdditionalAction(error: any): Promise<InternalCheckoutSelectors> {
        if (!(error instanceof RequestError) || !some(error.body.errors, {code: 'additional_action_required'})) {
            return Promise.reject(error);
        }
        const { additional_action_required: { data : { redirect_url } } } = error.body;

        return new Promise(() => window.location.replace(redirect_url));
    }

    private _getInitializeOptions(): MolliePaymentInitializeOptions {
        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._initializeOptions;
    }

    private _loadMollieJs(merchantId: string, locale: string, testmode = false): Promise<MollieClient> {
        if (this._mollieClient) {
            return Promise.resolve(this._mollieClient);
        }

        return this._mollieScriptLoader
            .load(merchantId, locale, testmode);
    }

    private _getMollieClient(): MollieClient {
        if (!this._mollieClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._mollieClient;
    }

    private _getShopperLocale(): string {
        if (!this._locale) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._locale;
    }

    /**
     * ContainerId is use in Mollie for determined either its showing or not the
     * container, because when Mollie has Vaulted Instruments it gets hide,
     * and shows an error because can't mount Provider Components
     *
     * We had to add a settimeout because Mollie sets de tab index after mounting
     * each component, but without a setTimeOut Mollie is not able to find the
     * components as they are hidden so we need to wait until they are shown
     */
    private _mountElements() {
        const { containerId, cardNumberId, cardCvcId, cardExpiryId, cardHolderId, styles } = this._getInitializeOptions();
        let container: HTMLElement | null;

        if (containerId) {
            container = document.getElementById(containerId);
        }

        setTimeout(() => {
            if (!containerId || container?.style.display !== 'none') {
                const mollieClient = this._getMollieClient();

                this._cardHolderElement = mollieClient.createComponent('cardHolder', { styles });
                this._cardHolderElement.mount(`#${cardHolderId}`);

                this._cardNumberElement = mollieClient.createComponent('cardNumber', { styles });
                this._cardNumberElement.mount(`#${cardNumberId}`);

                this._verificationCodeElement = mollieClient.createComponent('verificationCode', { styles });
                this._verificationCodeElement.mount(`#${cardCvcId}`);

                this._expiryDateElement = mollieClient.createComponent('expiryDate', { styles });
                this._expiryDateElement.mount(`#${cardExpiryId}`);
            }
        }, 0);
    }

    private _loadPaymentMethodsAllowed(mollie: MolliePaymentInitializeOptions, methodId: string, gatewayId: string, state: InternalCheckoutSelectors){
        if (methodsNotAllowedWhenDigitalOrder.includes(methodId)) {
            const cart = state.cart.getCartOrThrow();
            const cartDigitalItems = cart.lineItems.digitalItems;

            if (cartDigitalItems && cartDigitalItems.length > 0) {
                const { containerId } = this._getInitializeOptions();

                if (containerId) {
                    const container = document.getElementById(containerId);

                    if (container) {
                        const paragraph = document.createElement('p') ;
                        paragraph.setAttribute("id",`${gatewayId}-${methodId}-paragraph`)

                        if (mollie.unsupportedMethodMessage) {
                            paragraph.innerText = mollie.unsupportedMethodMessage;
                            container.appendChild(paragraph);
                            mollie.disableButton(true);
                        }
                    }
                }
            }
        }
    }
}
