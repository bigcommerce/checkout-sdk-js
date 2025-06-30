/* eslint-disable @typescript-eslint/naming-convention */
import { isEmpty, map, omitBy } from 'lodash';

import {
    HostedForm,
    HostedFormOptions,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import MonerisStylingProps, {
    MoneriesHostedFieldsQueryParams,
    MonerisInitializationData,
    MonerisResponseData,
} from './moneris';
import MonerisPaymentInitializeOptions, {
    WithMonerisPaymentInitializeOptions,
} from './moneris-payment-initialize-options';

const IFRAME_NAME = 'moneris-payment-iframe';
const RESPONSE_SUCCESS_CODE = '001';

export default class MonerisPaymentStrategy {
    private iframe?: HTMLIFrameElement;
    private initializeOptions?: MonerisPaymentInitializeOptions;
    private windowEventListener?: (response: MessageEvent) => void;

    private hostedForm?: HostedForm;
    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    async initialize(
        options: PaymentInitializeOptions & WithMonerisPaymentInitializeOptions,
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();

        const { moneris: monerisOptions, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "methodId" argument is not provided.',
            );
        }

        if (!monerisOptions) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.moneris" argument is not provided.',
            );
        }

        this.initializeOptions = monerisOptions;

        const { config, initializationData } =
            state.getPaymentMethodOrThrow<MonerisInitializationData>(methodId);

        if (!initializationData?.profileId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (monerisOptions.form && this.shouldShowTSVHostedForm(methodId)) {
            this.hostedForm = await this.mountCardVerificationfields(monerisOptions.form);
        }

        if (!this.iframe) {
            this.iframe = this.createIframe(
                monerisOptions.containerId,
                initializationData,
                !!config.testMode,
            );
        }

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentInitializeOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { isStoreCreditApplied: useStoreCredit } = this.paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        if (useStoreCredit) {
            await this.paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }

        await this.paymentIntegrationService.submitOrder(order, options);

        if (payment.paymentData && isVaultedInstrument(payment.paymentData)) {
            await this.executeWithVaulted(payment);

            return;
        }

        return this.executeWithCC(payment);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        if (this.hostedForm) {
            this.hostedForm.detach();
        }

        if (this.windowEventListener) {
            window.removeEventListener('message', this.windowEventListener);
            this.windowEventListener = undefined;
        }

        if (this.iframe && this.iframe.parentNode) {
            this.iframe.parentNode.removeChild(this.iframe);
            this.iframe = undefined;
        }

        return Promise.resolve();
    }

    private async executeWithCC(payment: OrderPaymentRequestBody): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(payment.methodId);

        const testMode = paymentMethod.config.testMode;
        const paymentData = payment.paymentData || {};

        const instrumentSettings = isHostedInstrumentLike(paymentData)
            ? paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = instrumentSettings;

        const nonce = await new Promise<string | undefined>((resolve, reject) => {
            if (!this.iframe) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const frameref: Window | null = this.iframe.contentWindow;

            if (frameref === null) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            frameref.postMessage('tokenize', this.monerisURL(!!testMode));

            this.windowEventListener = (response: MessageEvent) => {
                if (
                    typeof response.data !== 'string' ||
                    response.origin !== `https://${testMode ? 'esqa' : 'www3'}.moneris.com`
                ) {
                    return;
                }

                try {
                    resolve(this.handleMonerisResponse(response));
                } catch (error) {
                    reject(error);
                }
            };

            window.addEventListener('message', this.windowEventListener);
        });

        if (nonce !== undefined) {
            await this.paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
                paymentData: { nonce, shouldSaveInstrument, shouldSetAsDefaultInstrument },
            });
        }
    }

    private async executeWithVaulted(
        payment: OrderPaymentRequestBody,
    ): Promise<PaymentIntegrationSelectors> {
        if (this.hostedForm) {
            const form = this.hostedForm;

            await form.validate();
            await form.submit(payment);

            return this.paymentIntegrationService.loadCurrentOrder();
        }

        return this.paymentIntegrationService.submitPayment(payment);
    }

    private shouldShowTSVHostedForm(methodId: string): boolean {
        return this.isHostedPaymentFormEnabled(methodId) && this.isHostedFieldAvailable();
    }

    private isHostedPaymentFormEnabled(methodId: string): boolean {
        const paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(methodId);

        return Boolean(paymentMethod.config.isHostedFormEnabled);
    }

    private isHostedFieldAvailable(): boolean {
        const options = this.getInitializeOptions();
        const definedFields = omitBy(options.form?.fields, isEmpty);

        return !isEmpty(definedFields);
    }

    private getInitializeOptions(): MonerisPaymentInitializeOptions {
        if (!this.initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.initializeOptions;
    }

    private async mountCardVerificationfields(formOptions: HostedFormOptions): Promise<HostedForm> {
        const bigpayBaseUrl = this.paymentIntegrationService.getState().getStoreConfig()
            ?.paymentSettings.bigpayBaseUrl;

        if (!bigpayBaseUrl) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        const form = this.paymentIntegrationService.createHostedForm(bigpayBaseUrl, formOptions);

        await form.attach();

        return form;
    }

    private createIframe(
        containerId: string,
        initializationData: MonerisInitializationData,
        testMode: boolean,
        style?: MonerisStylingProps,
    ): HTMLIFrameElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to create iframe without valid container ID.');
        }

        const iframe: HTMLIFrameElement = document.createElement('iframe');
        const monerisQueryParams: MoneriesHostedFieldsQueryParams = {
            id: initializationData.profileId,
            pmmsg: true,
            display_labels: 1,
            enable_exp: 1,
            enable_cvd: 1,
            css_body:
                style?.cssBody ||
                'font-family: Arial, Helvetica,sans-serif;background: transparent;',
            css_textbox:
                style?.cssTextbox ||
                'border-radius:4px;border: 2px solid rgb(00,00,00);width: 100%;font-weight: 600;padding: 8px 8px;outline: 0;',
            css_textbox_pan: style?.cssTextboxCardNumber || 'width: 240px;',
            css_textbox_exp:
                style?.cssTextboxExpiryDate || 'margin-bottom: 0;width: calc(30% - 12px);',
            css_textbox_cvd: style?.cssTextboxCVV || 'margin-bottom: 0;width: calc(30% - 12px);',
            css_input_label:
                style?.cssInputLabel ||
                'font-size: 10px;position: relative;top: 8px;left: 6px;background: rgb(255,255,255);padding: 3px 2px;color: rgb(66,66,66);font-weight: 600;z-index: 2;',
            pan_label: initializationData.creditCardLabel || 'Credit Card Number',
            exp_label: initializationData.expiryDateLabel || 'Expiration',
            cvd_label: initializationData.cvdLabel || 'CVD',
        };

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const queryString = map(monerisQueryParams, (value, key) => `${key}=${value}`).join('&');

        iframe.width = '100%';
        iframe.height = '100%';
        iframe.name = IFRAME_NAME;
        iframe.id = IFRAME_NAME;
        iframe.style.border = 'none';
        iframe.src = `${this.monerisURL(testMode)}?${queryString}`;
        iframe.allow = 'payment';

        container.appendChild(iframe);

        return iframe;
    }

    private handleMonerisResponse(response: MessageEvent): string {
        const monerisResponse: MonerisResponseData = JSON.parse(response.data);

        if (monerisResponse.responseCode[0] !== RESPONSE_SUCCESS_CODE) {
            throw new Error(monerisResponse.errorMessage);
        }

        return monerisResponse.dataKey;
    }

    private monerisURL(testMode: boolean): string {
        return `https://${testMode ? 'esqa' : 'www3'}.moneris.com/HPPtoken/index.php`;
    }
}
