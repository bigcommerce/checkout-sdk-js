import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError , MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import MonerisStylingProps,  { MonerisResponseData } from './moneris';

const IFRAME_NAME = 'moneris-payment-iframe';
const RESPONSE_SUCCESS_CODE = '001';

export default class MonerisPaymentStrategy implements PaymentStrategy {
    private _iframe?: HTMLIFrameElement;
    private _monerisURL?: string;
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

        this._iframe = this._createIframe(monerisOptions.containerId, initializationData.profileId, !!config.testMode);

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { isStoreCreditApplied: useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit !== undefined) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const nonce = await new Promise<string | undefined>((resolve, reject) => {
            const frameref = this._iframe?.contentWindow;

            if (!this._monerisURL) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            frameref?.postMessage('tokenize', this._monerisURL);

            this._windowEventListener = (response: MessageEvent) => this._handleMonerisResponse(response, resolve, reject);

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

        return Promise.resolve(this._store.getState());
    }

    private _createIframe(containerId: string, profileId: string, testMode: boolean, style?: MonerisStylingProps): HTMLIFrameElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to create iframe without valid container ID.');
        }

        const iframe = document.createElement('iframe');
        // Example CSS styling as provided by Moneris' documentation
        const cssBody = style?.cssBody ?? 'background:white;';
        const cssTextbox = style?.cssTextbox ?? 'border-width:2px;';
        const csstextboxPan = style?.cssTextboxPan ?? 'width:140px;';
        const cssTextboxExpiry = style?.cssTextboxExpiry ?? 'width:40px;';
        const csstexboxCvd = style?.csstexboxCvd ?? 'width:40px';

        iframe.name = IFRAME_NAME;
        iframe.id = IFRAME_NAME;

        this._monerisURL = `https://${ testMode ? 'esqa' : 'www3' }.moneris.com/HPPtoken/index.php`;

        iframe.src = `${ this._monerisURL }?id=${profileId}&pmmsg=true&css_body=${cssBody}&css_textbox=${cssTextbox}&css_textbox_pan=${csstextboxPan}&enable_exp=1&css_textbox_exp=${cssTextboxExpiry}&enable_cvd=1&css_textbox_cvd=${csstexboxCvd}&display_labels=1`;

        container.appendChild(iframe);

        return iframe;
    }

    private _handleMonerisResponse(response: MessageEvent, resolve: (nonce: string) => void, reject: (reason: Error) => void): void {
        const monerisResponse: MonerisResponseData = JSON.parse(response.data);

        if (monerisResponse.responseCode[0] !== RESPONSE_SUCCESS_CODE) {
            return reject(new Error(monerisResponse.errorMessage));
        }

        return resolve(monerisResponse.dataKey);
    }
}
