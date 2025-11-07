import { merge, some } from 'lodash';

import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    isRequestError,
    NotInitializedError,
    NotInitializedErrorType,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    WithWorldpayAccessPaymentInitializeOptions,
    WorldpayAccess3DSOptions,
    WorldpayAccessAdditionalAction,
    WorldpayAccessPaymentInitializeOptions,
} from './worldpayaccess-payment-options';

const IFRAME_NAME = 'worldpay_hosted_payment_page';
const IFRAME_HIDDEN_NAME = 'worldpay_hosted_hidden_payment_page';
const PAYMENT_CANNOT_CONTINUE = 'Payment cannot continue';

let submit: (paymentPayload: OrderPaymentRequestBody) => Promise<void>;

export default class WorldpayAccessPaymentStrategy extends CreditCardPaymentStrategy {
    private _initializeOptions?: WorldpayAccessPaymentInitializeOptions;

    async initialize(
        options?: PaymentInitializeOptions & WithWorldpayAccessPaymentInitializeOptions,
    ): Promise<void> {
        this._initializeOptions = options && options.worldpay;

        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return super.initialize(options);
    }

    async execute(
        orderRequest: OrderRequestBody,
        options?: PaymentInitializeOptions,
    ): Promise<void> {
        const { payment } = orderRequest;

        submit = this._submitAdditionalAction();

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            return await super.execute(orderRequest, options);
        } catch (error) {
            return this._processAdditionalAction(error, payment);
        }
    }

    private async _processAdditionalAction(
        error: unknown,
        payment: OrderPaymentRequestBody,
    ): Promise<void> {
        if (
            !isRequestError(error) ||
            !some(error.body.errors, { code: 'additional_action_required' })
        ) {
            return Promise.reject(error);
        }

        return new Promise((resolve, reject) => {
            const messageEventListener = async (event: MessageEvent) => {
                if (event.origin !== 'https://centinelapistag.cardinalcommerce.com') {
                    return;
                }

                if (typeof event.data !== 'string' || !this._isValidJsonWithSessionId(event.data)) {
                    return reject(new Error(PAYMENT_CANNOT_CONTINUE));
                }

                window.removeEventListener('message', messageEventListener);
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                iframeHidden.remove();

                const data = JSON.parse(event.data);
                const paymentPayload = merge({}, payment, {
                    paymentData: { threeDSecure: { token: data.SessionId } },
                });

                try {
                    resolve(await submit(paymentPayload));
                } catch (submitError) {
                    if (
                        !isRequestError(submitError) ||
                        !some(submitError.body.errors, { code: 'three_d_secure_required' })
                    ) {
                        return reject(submitError);
                    }

                    if (!this._initializeOptions) {
                        return reject(
                            new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                        );
                    }

                    const { onLoad } = this._initializeOptions;

                    const frame = this._createIframe(submitError.body.three_ds_result);

                    try {
                        onLoad(frame, () => reject(new Error('Payment was cancelled')));
                    } catch (onLoadError) {
                        reject(new Error(PAYMENT_CANNOT_CONTINUE));
                    }
                }
            };

            window.addEventListener('message', messageEventListener);

            let iframeHidden: HTMLIFrameElement;

            try {
                iframeHidden = this._createHiddenIframe(error.body);
            } catch (e) {
                window.removeEventListener('message', messageEventListener);
                throw new Error(PAYMENT_CANNOT_CONTINUE);
            }
        });
    }

    private _createHiddenIframe(body: WorldpayAccessAdditionalAction): HTMLIFrameElement {
        const iframe = document.createElement('iframe');

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
            if (!this._hostedForm) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const hostedForm = this._hostedForm;

            return async (paymentPayload: OrderPaymentRequestBody) => {
                await hostedForm.submit(paymentPayload);
            };
        }

        return async (paymentPayload: OrderPaymentRequestBody) => {
            await this._paymentIntegrationService.submitPayment(paymentPayload);
        };
    }

    private _isValidJsonWithSessionId(str: string) {
        try {
            const data = JSON.parse(str);

            if (data.SessionId && data.Status) {
                return true;
            }

            return false;
        } catch (e) {
            return false;
        }
    }
}
