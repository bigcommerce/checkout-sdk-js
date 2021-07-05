import { map } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError , MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import MonerisStylingProps,  { MoneriesHostedFieldsQueryParams, MonerisInitializationData, MonerisResponseData } from './moneris';

const IFRAME_NAME = 'moneris-payment-iframe';
const RESPONSE_SUCCESS_CODE = '001';

export default class MonerisPaymentStrategy implements PaymentStrategy {
    private _iframe?: HTMLIFrameElement;
    private _windowEventListener?: (response: MessageEvent) => void;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();

        const { moneris: monerisOptions } = options;
        const { config, initializationData } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        if (!monerisOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.moneris" argument is not provided.');
        }

        if (!initializationData?.profileId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!this._iframe) {
            this._iframe = this._createIframe(monerisOptions.containerId, initializationData, !!config.testMode);
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { payment , ...order } = payload;
        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const paymentMethod = getPaymentMethodOrThrow(payment.methodId);
        const testMode = paymentMethod.config.testMode;

        const { isStoreCreditApplied: useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit !== undefined) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const nonce = await new Promise<string | undefined>((resolve, reject) => {
            if (!this._iframe) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const frameref = this._iframe.contentWindow;

            frameref?.postMessage('tokenize', this._monerisURL(!!testMode));

            this._windowEventListener = (response: MessageEvent) => {
                try {
                    resolve(this._handleMonerisResponse(response));
                } catch (error) {
                    reject(error);
                }
            };

            window.addEventListener('message', this._windowEventListener);
        });

        if (nonce !== undefined) {
            return this._store.dispatch(this._paymentActionCreator.submitPayment({
                methodId: payment.methodId,
                paymentData: { nonce },
            }));
        }

        return this._store.getState();
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
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

    private _createIframe(containerId: string, initializationData: MonerisInitializationData, testMode: boolean, style?: MonerisStylingProps): HTMLIFrameElement {
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
            css_body: style?.cssBody || 'background:white;',
            css_textbox: style?.cssTextbox || 'border-width:2px;',
            css_textbox_pan: style?.cssTextboxPan || 'width:140px;',
            css_textbox_exp: style?.cssTextboxExpiry || 'width:40px;',
            css_textbox_cvd: style?.csstexboxCvd || 'width:40px',
            pan_label: initializationData?.creditCardLabel || 'Credit Card Number',
            exp_label: initializationData?.expiryDateLabel || 'Expiration',
            cvd_label: initializationData?.cvdLabel || 'CVD',
        };

        const queryString = map(monerisQueryParams, (value, key) => `${key}=${value}`).join('&');

        iframe.name = IFRAME_NAME;
        iframe.id = IFRAME_NAME;

        iframe.src = `${ this._monerisURL(testMode) }?${queryString}`;

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
        return `https://${ testMode ? 'esqa' : 'www3' }.moneris.com/HPPtoken/index.php`;
    }
}
