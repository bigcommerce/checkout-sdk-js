import { merge, some } from 'lodash';

import { InternalCheckoutSelectors } from '../../../checkout';
import {
    NotInitializedError,
    NotInitializedErrorType,
    RequestError,
} from '../../../common/error/errors';
import { OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentInitializeOptions } from '../../payment-request-options';
import { CreditCardPaymentStrategy } from '../credit-card';

import {
    WorldpayAccess3DSOptions,
    WorldpayAccessAdditionalAction,
    WorldpayAccessPaymentInitializeOptions,
} from './worldpayaccess-payment-options';

const IFRAME_NAME = 'worldpay_hosted_payment_page';
const IFRAME_HIDDEN_NAME = 'worldpay_hosted_hidden_payment_page';
const PAYMENT_CANNOT_CONTINUE = 'Payment cannot continue';

let submit: (paymentPayload: OrderPaymentRequestBody) => Promise<InternalCheckoutSelectors>;

export default class WorldpayaccessPaymetStrategy extends CreditCardPaymentStrategy {
    private _initializeOptions?: WorldpayAccessPaymentInitializeOptions;

    async initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._initializeOptions = options && options.worldpay;

        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return super.initialize(options);
    }

    async execute(
        orderRequest: OrderRequestBody,
        options?: PaymentInitializeOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment } = orderRequest;

        submit = this._submitAdditionalAction();

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            return await super.execute(orderRequest, options);
        } catch (error) {
            return await this._processAdditionalAction(error, payment);
        }
    }

    private async _processAdditionalAction(
        error: unknown,
        payment: OrderPaymentRequestBody,
    ): Promise<InternalCheckoutSelectors> {
        if (
            !(error instanceof RequestError) ||
            !some(error.body.errors, { code: 'additional_action_required' })
        ) {
            return Promise.reject(error);
        }

        return new Promise((resolve, reject) => {
            const messageEvent = async (event: MessageEvent) => {
                if (typeof event.data !== 'string' || !this._isValidJsonWithSessionId(event.data)) {
                    return reject(new Error(PAYMENT_CANNOT_CONTINUE));
                }

                window.removeEventListener('message', messageEvent);
                iframeHidden.remove();

                const data = JSON.parse(event.data);
                const paymentPayload = merge({}, payment, {
                    paymentData: { threeDSecure: { token: data.SessionId } },
                });

                try {
                    resolve(await submit(paymentPayload));
                } catch (error) {
                    if (
                        !(error instanceof RequestError) ||
                        !some(error.body.errors, { code: 'three_d_secure_required' })
                    ) {
                        return reject(error);
                    }

                    if (!this._initializeOptions) {
                        return reject(
                            new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                        );
                    }

                    const { onLoad } = this._initializeOptions;
                    const frame = this._createIframe(error.body.three_ds_result);

                    try {
                        onLoad(frame, () => reject(new Error('Payment was cancelled')));
                    } catch (e) {
                        reject(new Error(PAYMENT_CANNOT_CONTINUE));
                    }
                }
            };

            window.addEventListener('message', messageEvent);

            let iframeHidden: HTMLIFrameElement;

            try {
                iframeHidden = this._createHiddenIframe(error.body);
            } catch (e) {
                window.removeEventListener('message', messageEvent);
                throw new Error(PAYMENT_CANNOT_CONTINUE);
            }
        });
    }

    private _createHiddenIframe(body: WorldpayAccessAdditionalAction): HTMLIFrameElement {
        const iframe = document.createElement('iframe');

        if (!iframe) {
            throw new Error();
        }

        document.body.appendChild(iframe);

        if (!iframe.contentWindow) {
            throw new Error();
        }

        iframe.id = IFRAME_HIDDEN_NAME;
        iframe.height = '0px';
        iframe.width = '0px';

        const form = document.createElement('form');
        const formId = 'collectionForm';

        form.id = formId;
        form.name = 'devicedata';
        form.method = 'post';

        const url = body.additional_action_required.data.redirect_url;

        form.action = url;

        const inputBin = document.createElement('input');

        inputBin.name = 'Bin';
        inputBin.type = 'hidden';
        inputBin.value = body.provider_data.source_id;
        form.appendChild(inputBin);

        const inputJWT = document.createElement('input');

        inputJWT.name = 'JWT';
        inputJWT.type = 'hidden';
        inputJWT.value = body.provider_data.data;
        form.appendChild(inputJWT);

        const button = document.createElement('button');

        button.type = 'submit';
        button.id = 'btnsubmit';
        form.appendChild(button);

        if (navigator.userAgent.match('Firefox')) {
            iframe.srcdoc = form.outerHTML;
        } else {
            iframe.contentWindow.document.body.appendChild(form);
        }

        const script = document.createElement('script');

        script.innerHTML = `
            document.getElementById('${formId}').submit();
        `;
        iframe.contentWindow.document.body.appendChild(script);

        return iframe;
    }

    private _createIframe(data: WorldpayAccess3DSOptions): HTMLIFrameElement {
        const form = document.createElement('form');

        form.id = 'challengeForm';
        form.method = 'POST';
        form.action = data.acs_url;

        const inputJWT = document.createElement('input');

        inputJWT.name = 'JWT';
        inputJWT.type = 'hidden';
        inputJWT.value = data.payer_auth_request;
        form.appendChild(inputJWT);

        const merchant = document.createElement('input');

        merchant.name = 'MD';
        merchant.type = 'hidden';
        merchant.value = `merchantSessionId=${data.merchant_data}`;
        form.appendChild(merchant);

        const script = document.createElement('script');

        script.type = 'text/javascript';
        script.innerHTML =
            "window.onload = function() { document.getElementById('challengeForm').submit(); }";

        const iframe = document.createElement('iframe');

        iframe.name = IFRAME_NAME;
        iframe.height = '400';
        iframe.width = '100%';
        iframe.srcdoc = `${form.outerHTML} ${script.outerHTML}`;

        return iframe;
    }

    private _submitAdditionalAction() {
        if (this._shouldRenderHostedForm) {
            if (!this._hostedForm || !this._hostedForm.submit) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const hostedForm = this._hostedForm;

            return async (paymentPayload: OrderPaymentRequestBody) => {
                await hostedForm.submit(paymentPayload);

                return this._store.getState();
            };
        }

        return async (paymentPayload: OrderPaymentRequestBody) => {
            return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        };
    }

    private _isValidJsonWithSessionId(str: string) {
        try {
            const data = JSON.parse(str);

            if (data.SessionId) {
                return true;
            }

            return false;
        } catch (e) {
            return false;
        }
    }
}
