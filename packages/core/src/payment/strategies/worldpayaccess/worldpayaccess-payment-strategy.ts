import { merge, some } from 'lodash';
import { InternalCheckoutSelectors } from '../../../checkout';
import { NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentInitializeOptions } from '../../payment-request-options';
import { CreditCardPaymentStrategy } from '../credit-card';
import { WorldpayAccess3DSOptions, WorldpayAccessAdditionalAction, WorldpayAccessPaymentInitializeOptions } from './worldpayaccess-payment-options';

const IFRAME_NAME = 'worldpay_hosted_payment_page';
const IFRAME_HIDDEN_NAME = 'worldpay_hosted_hidden_payment_page';
const INVALID_URL = 'invalid url';

export default class WorldpayaccessPaymetStrategy extends CreditCardPaymentStrategy {

    private _initializeOptions?: WorldpayAccessPaymentInitializeOptions;

    async initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!options?.worldpay) {
            throw new NotInitializedError(
                NotInitializedErrorType.PaymentNotInitialized
            );
        }

        this._initializeOptions = options.worldpay;

        return super.initialize(options);
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            return await super.execute(orderRequest, options);
        } catch(error){
            return await this._processAdditionalAction(error, payment);
        }
    }

    private async _processAdditionalAction(error: unknown, payment: OrderPaymentRequestBody): Promise<InternalCheckoutSelectors> {
        if (!(error instanceof RequestError) || !some(error.body.errors, {code: 'additional_action_required'})) {
            return Promise.reject(error);
        }

        const iframe = this._createHiddenIframe(error.body);
        return new Promise((resolve, reject) => {
            const message_event = async (event: MessageEvent) => {
                window.removeEventListener('message', message_event);

                if (iframe) {
                    iframe.remove();
                }

                if (typeof event.data !== 'string' || event.data === INVALID_URL) {
                    reject(new Error('Payment cannot continue'));
                }

                const data = JSON.parse(event.data);
                const paymentPayload = merge({}, payment, { paymentData: { threeDSecure: { token: data.SessionId } } });

                try {
                    return resolve(await this._store.dispatch(this._paymentActionCreator.submitPayment( paymentPayload )));
                } catch (error) {
                    if (!(error instanceof RequestError) || !some(error.body.errors, {code: 'three_d_secure_required'})) {
                        return reject(error);
                    }

                    this._3dsrequired(error.body.three_ds_result, reject);
                }

            }

            window.addEventListener('message', message_event);
        });
    }

    private _3dsrequired(data: WorldpayAccess3DSOptions, reject: Function):void {
        if (!this._initializeOptions) {
            throw new NotInitializedError(
                NotInitializedErrorType.PaymentNotInitialized
            );
        }

        const { onLoad } = this._initializeOptions;
        const frame = this._createIframe(data);
        onLoad(frame, () => reject());
    }

    private _createHiddenIframe(body: WorldpayAccessAdditionalAction): HTMLIFrameElement {
        const iframe = document.createElement('iframe');
        iframe.id = IFRAME_HIDDEN_NAME;
        iframe.height = '0px';
        iframe.width = '0px';
        document.body.appendChild(iframe);

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

        iframe.contentWindow?.document.body.appendChild(form);

        const script = document.createElement('script');
        script.innerHTML = `
            const data = new URLSearchParams()
            data.append('Bin', '${body.provider_data.source_id}');
            data.append('JWT', '${body.provider_data.data}');

            window.parent.fetch('${url}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data
            })
            .then((response) => {
                if(!response.ok) {
                    window.parent.postMessage('${INVALID_URL}', '*')
                }

                document.getElementById('${formId}').submit();
            })
            .catch((error) =>  {
                window.parent.postMessage('${INVALID_URL}', '*')
            })
        `;
        iframe.contentWindow?.document.body.appendChild(script);

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
        merchant.value = 'merchantSessionId=' + data.merchant_data;
        form.appendChild(merchant);

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = "window.onload = function() { document.getElementById('challengeForm').submit(); }"

        const iframe = document.createElement('iframe');
        iframe.name = IFRAME_NAME;
        iframe.height = '400';
        iframe.width = '100%';
        iframe.srcdoc = `${form.outerHTML} ${script.outerHTML}`;

        return iframe;
    }
}
