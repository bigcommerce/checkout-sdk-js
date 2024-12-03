import { isEmpty, map, omitBy } from 'lodash';

import { isHostedInstrumentLike } from '../../';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { HostedForm, HostedFormFactory, LegacyHostedFormOptions } from '../../../hosted-form';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import MonerisStylingProps, {
    MoneriesHostedFieldsQueryParams,
    MonerisInitializationData,
    MonerisResponseData,
} from './moneris';
import MonerisPaymentInitializeOptions from './moneris-payment-initialize-options';

const IFRAME_NAME = 'moneris-payment-iframe';
const RESPONSE_SUCCESS_CODE = '001';

export default class MonerisPaymentStrategy implements PaymentStrategy {
    private _iframe?: HTMLIFrameElement;
    private _initializeOptions?: MonerisPaymentInitializeOptions;
    private _windowEventListener?: (response: MessageEvent) => void;

    private _hostedForm?: HostedForm;

    constructor(
        private _hostedFormFactory: HostedFormFactory,
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();

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

        this._initializeOptions = monerisOptions;

        const { config, initializationData } =
            state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!initializationData?.profileId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (monerisOptions.form && this._shouldShowTSVHostedForm(methodId)) {
            this._hostedForm = await this._mountCardVerificationfields(monerisOptions.form);
        }

        if (!this._iframe) {
            this._iframe = this._createIframe(
                monerisOptions.containerId,
                initializationData,
                !!config.testMode,
            );
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentInitializeOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { isStoreCreditApplied: useStoreCredit } = this._store
            .getState()
            .checkout.getCheckoutOrThrow();

        if (useStoreCredit !== undefined) {
            await this._store.dispatch(
                this._storeCreditActionCreator.applyStoreCredit(useStoreCredit),
            );
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        if (payment.paymentData && isVaultedInstrument(payment.paymentData)) {
            return this._executeWithVaulted(payment);
        }

        return this._executeWithCC(payment);
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._hostedForm) {
            this._hostedForm.detach();
        }

        if (this._windowEventListener) {
            window.removeEventListener('message', this._windowEventListener);
            this._windowEventListener = undefined;
        }

        if (this._iframe && this._iframe.parentNode) {
            this._iframe.parentNode.removeChild(this._iframe);
            this._iframe = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    private async _executeWithCC(
        payment: OrderPaymentRequestBody,
    ): Promise<InternalCheckoutSelectors> {
        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(payment.methodId);

        const testMode = paymentMethod.config.testMode;
        const paymentData = payment.paymentData || {};
        const instrumentSettings = isHostedInstrumentLike(paymentData)
            ? paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = instrumentSettings;

        const nonce = await new Promise<string | undefined>((resolve, reject) => {
            if (!this._iframe) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const frameref = this._iframe.contentWindow;

            frameref?.postMessage('tokenize', this._monerisURL(!!testMode));

            this._windowEventListener = (response: MessageEvent) => {
                if (typeof response.data !== 'string') {
                    return;
                }

                try {
                    resolve(this._handleMonerisResponse(response));
                } catch (error) {
                    reject(error);
                }
            };

            window.addEventListener('message', this._windowEventListener);
        });

        if (nonce !== undefined) {
            return this._store.dispatch(
                this._paymentActionCreator.submitPayment({
                    methodId: payment.methodId,
                    paymentData: { nonce, shouldSaveInstrument, shouldSetAsDefaultInstrument },
                }),
            );
        }

        return this._store.getState();
    }

    private async _executeWithVaulted(
        payment: OrderPaymentRequestBody,
    ): Promise<InternalCheckoutSelectors> {
        if (this._hostedForm) {
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

    private _shouldShowTSVHostedForm(methodId: string): boolean {
        return this._isHostedPaymentFormEnabled(methodId) && this._isHostedFieldAvailable();
    }

    private _isHostedPaymentFormEnabled(methodId: string): boolean {
        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId);

        return Boolean(paymentMethod.config.isHostedFormEnabled);
    }

    private _isHostedFieldAvailable(): boolean {
        const options = this._getInitializeOptions();
        const definedFields = omitBy(options.form?.fields, isEmpty);

        return !isEmpty(definedFields);
    }

    private _getInitializeOptions(): MonerisPaymentInitializeOptions {
        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._initializeOptions;
    }

    private async _mountCardVerificationfields(
        formOptions: LegacyHostedFormOptions,
    ): Promise<HostedForm> {
        const { config } = this._store.getState();
        const bigpayBaseUrl = config.getStoreConfig()?.paymentSettings.bigpayBaseUrl;

        if (!bigpayBaseUrl) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        const form = this._hostedFormFactory.create(bigpayBaseUrl, formOptions);

        await form.attach();

        return form;
    }

    private _createIframe(
        containerId: string,
        initializationData: MonerisInitializationData,
        testMode: boolean,
        style?: MonerisStylingProps,
    ): HTMLIFrameElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to create iframe without valid container ID.');
        }

        const iframe = document.createElement('iframe');
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

        const queryString = map(monerisQueryParams, (value, key) => `${key}=${value}`).join('&');

        iframe.width = '100%';
        iframe.height = '100%';
        iframe.name = IFRAME_NAME;
        iframe.id = IFRAME_NAME;
        iframe.style.border = 'none';
        iframe.src = `${this._monerisURL(testMode)}?${queryString}`;

        container.appendChild(iframe);

        return iframe;
    }

    private _handleMonerisResponse(response: MessageEvent): string {
        const monerisResponse: MonerisResponseData = JSON.parse(response.data);

        if (monerisResponse.responseCode[0] !== RESPONSE_SUCCESS_CODE) {
            throw new Error(monerisResponse.errorMessage);
        }

        return monerisResponse.dataKey;
    }

    private _monerisURL(testMode: boolean): string {
        return `https://${testMode ? 'esqa' : 'www3'}.moneris.com/HPPtoken/index.php`;
    }
}
