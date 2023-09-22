import { each, some } from 'lodash';

import {
    getBrowserInfo,
    HostedForm,
    HostedFormOptions,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isRequestError,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { MollieClient, MollieElement } from './mollie';
import MolliePaymentInitializeOptions, {
    WithMolliePaymentInitializeOptions,
} from './mollie-payment-initialize-options';
import MollieScriptLoader from './mollie-script-loader';

export enum MolliePaymentMethodType {
    CREDIT_CARD = 'credit_card',
}

const methodsNotAllowedWhenDigitalOrder = ['klarnapaylater', 'klarnasliceit'];

export default class MolliePaymentStrategy implements PaymentStrategy {
    private initializeOptions?: MolliePaymentInitializeOptions;
    private mollieClient?: MollieClient;
    private cardHolderElement?: MollieElement;
    private cardNumberElement?: MollieElement;
    private verificationCodeElement?: MollieElement;
    private expiryDateElement?: MollieElement;
    private locale?: string;

    private hostedForm?: HostedForm;

    private unsubscribe?: () => void;

    constructor(
        private mollieScriptLoader: MollieScriptLoader,
        private paymentIntegrationService: PaymentIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithMolliePaymentInitializeOptions,
    ): Promise<void> {
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

        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfigOrThrow();

        this.initializeOptions = mollie;

        const paymentMethod = state.getPaymentMethodOrThrow(methodId, gatewayId);

        const {
            config: { merchantId, testMode },
        } = paymentMethod;

        this.locale = state.getLocale();

        if (!merchantId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (
            this.isCreditCard(methodId) &&
            mollie.form &&
            this.shouldShowTSVHostedForm(methodId, gatewayId)
        ) {
            this.hostedForm = await this.mountCardVerificationfields(mollie.form);
        } else if (this.isCreditCard(methodId)) {
            this.mollieClient = await this.loadMollieJs(
                merchantId,
                storeConfig.storeProfile.storeLanguage,
                testMode,
            );
            this.mountElements();
        }

        this.unsubscribe = () => {
            if (
                this.paymentIntegrationService.getState().isPaymentMethodInitialized({
                    methodId: options.methodId,
                    gatewayId: options.gatewayId,
                })
            ) {
                const element = document.getElementById(`${gatewayId}-${methodId}-paragraph`);

                if (element) {
                    element.remove();
                }

                mollie.disableButton(false);

                this.loadPaymentMethodsAllowed(mollie, methodId, gatewayId);
            }
        };

        this.unsubscribe();

        this.loadPaymentMethodsAllowed(mollie, methodId, gatewayId);

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const paymentData = payment?.paymentData;

        if (!payment || !payment.gatewayId || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment', 'gatewayId', 'paymentData']);
        }

        try {
            await this.paymentIntegrationService.submitOrder(order, options);

            if (isVaultedInstrument(paymentData)) {
                return await this.executeWithVaulted(payment);
            }

            if (this.isCreditCard(payment.methodId)) {
                return await this.executeWithCC(payment);
            }

            return await this.executeWithAPM(payment);
        } catch (error) {
            await this.processAdditionalAction(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.resolve();
    }

    deinitialize(options?: PaymentRequestOptions): Promise<void> {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        if (this.hostedForm) {
            this.hostedForm.detach();
        }

        if (options && options.methodId && options.gatewayId && !this.hostedForm) {
            const element = document.getElementById(`${options.gatewayId}-${options.methodId}`);

            if (element) {
                element.remove();
            }
        } else if (options && options.methodId && this.isCreditCard(options.methodId)) {
            if (
                this.cardHolderElement &&
                this.cardNumberElement &&
                this.verificationCodeElement &&
                this.expiryDateElement
            ) {
                this.cardHolderElement.unmount();
                this.cardHolderElement = undefined;

                this.cardNumberElement.unmount();
                this.cardNumberElement = undefined;

                this.verificationCodeElement.unmount();
                this.verificationCodeElement = undefined;

                this.expiryDateElement.unmount();
                this.expiryDateElement = undefined;
            }
        }

        this.mollieClient = undefined;

        return Promise.resolve();
    }

    protected async executeWithCC(payment: OrderPaymentRequestBody): Promise<void> {
        const paymentData = payment.paymentData;

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { token, error } = await this.getMollieClient().createToken();

        /* eslint-disable */
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
            shopper_locale: this.getShopperLocale(),
        };
        /* eslint-enable */

        await this.paymentIntegrationService.submitPayment({
            ...payment,
            paymentData: {
                formattedPayload,
            },
        });
    }

    protected async executeWithVaulted(payment: OrderPaymentRequestBody): Promise<void> {
        if (this.isHostedPaymentFormEnabled(payment.methodId, payment.gatewayId)) {
            const form = this.hostedForm;

            if (!form) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            await form.validate();
            await form.submit(payment);

            await this.paymentIntegrationService.loadCurrentOrder();
        } else {
            await this.paymentIntegrationService.submitPayment(payment);
        }
    }

    protected async executeWithAPM(payment: OrderPaymentRequestBody): Promise<void> {
        const paymentData = payment.paymentData;
        const issuer = paymentData && 'issuer' in paymentData ? paymentData.issuer : '';

        await this.paymentIntegrationService.submitPayment({
            ...payment,
            paymentData: {
                ...paymentData,
                formattedPayload: {
                    issuer,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    shopper_locale: this.getShopperLocale(),
                },
            },
        });
    }

    private isCreditCard(methodId: string): boolean {
        return methodId === MolliePaymentMethodType.CREDIT_CARD;
    }

    private shouldShowTSVHostedForm(methodId: string, gatewayId: string): boolean {
        return (
            this.isHostedPaymentFormEnabled(methodId, gatewayId) && this.isHostedFieldAvailable()
        );
    }

    private mountCardVerificationfields(formOptions: HostedFormOptions): Promise<HostedForm> {
        /* eslint-disable */
        return new Promise(async (resolve, reject) => {
            try {
                const config = this.paymentIntegrationService.getState().getStoreConfig();
                const bigpayBaseUrl = config?.paymentSettings.bigpayBaseUrl;

                if (!bigpayBaseUrl) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                const form = this.paymentIntegrationService.createHostedForm(
                    bigpayBaseUrl,
                    formOptions
                );

                await form.attach();

                resolve(form);
            } catch (error) {
                reject(error);
            }
        });
    }

    private isHostedPaymentFormEnabled(methodId: string, gatewayId?: string): boolean {
        const { getPaymentMethodOrThrow } = this.paymentIntegrationService.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private isHostedFieldAvailable(): boolean {
        const options = this.getInitializeOptions();

        return !!options.form?.fields;
    }

    private processAdditionalAction(error: any): Promise<unknown> {
        if (!isRequestError(error)) {
            return Promise.reject(error);
        }

        if (some(error.body.errors, {code: 'additional_action_required'})) {
            const { additional_action_required: { data : { redirect_url } } } = error.body;

            return new Promise(() => window.location.replace(redirect_url));
        }

        return Promise.reject(error);
    }

    private getInitializeOptions(): MolliePaymentInitializeOptions {
        if (!this.initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.initializeOptions;
    }

    private loadMollieJs(merchantId: string, locale: string, testmode = false): Promise<MollieClient> {
        if (this.mollieClient) {
            return Promise.resolve(this.mollieClient);
        }

        return this.mollieScriptLoader
            .load(merchantId, locale, testmode);
    }

    private getMollieClient(): MollieClient {
        if (!this.mollieClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.mollieClient;
    }

    private getShopperLocale(): string {
        if (!this.locale) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.locale;
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
    private mountElements() {
        const { containerId, cardNumberId, cardCvcId, cardExpiryId, cardHolderId, styles } = this.getInitializeOptions();
        let container: HTMLElement | null;

        if (containerId) {
            container = document.getElementById(containerId);
        }

        setTimeout(() => {
            if (!containerId || container?.style.display !== 'none') {
                const mollieClient = this.getMollieClient();

                this.cardHolderElement = mollieClient.createComponent('cardHolder', { styles });
                this.cardHolderElement.mount(`#${cardHolderId}`);

                this.cardNumberElement = mollieClient.createComponent('cardNumber', { styles });
                this.cardNumberElement.mount(`#${cardNumberId}`);

                this.verificationCodeElement = mollieClient.createComponent('verificationCode', { styles });
                this.verificationCodeElement.mount(`#${cardCvcId}`);

                this.expiryDateElement = mollieClient.createComponent('expiryDate', { styles });
                this.expiryDateElement.mount(`#${cardExpiryId}`);
            }
        }, 0);
    }

    private loadPaymentMethodsAllowed(mollie: MolliePaymentInitializeOptions, methodId: string, gatewayId: string){
        if (methodsNotAllowedWhenDigitalOrder.includes(methodId)) {
            const cart = this.paymentIntegrationService.getState().getCartOrThrow();
            const cartDigitalItems = cart.lineItems?.digitalItems;

            if (cartDigitalItems && cartDigitalItems.length > 0) {
                const { containerId } = this.getInitializeOptions();

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
