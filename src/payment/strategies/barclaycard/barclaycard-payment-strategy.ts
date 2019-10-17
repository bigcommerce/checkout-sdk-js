import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { Modal } from '../../../common/modal/';
import LoadingIndicator from '../../../embedded-checkout/loading-indicator';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { containerSuffix, iframeSuffix } from './barclaycard';

export default class BarclaycardPaymentStrategy implements PaymentStrategy {
    private _methodId!: string;
    private iframe!: HTMLIFrameElement;
    private modal!: Modal;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _loadingIndicator: LoadingIndicator,
        private _paymentActionCreator: PaymentActionCreator
    ) { }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;

        this.modal = new Modal({
            style: { },
            contentsId: `${this._methodId}${containerSuffix}`,
        });

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment} = payload;
        const iframeContainerId = `${this._methodId}${containerSuffix}`;

        if (!payment) {
            throw new PaymentArgumentInvalidError([this._methodId]);
        }

        this._loadingIndicator.show(iframeContainerId);

        return this._createPaymentIframe(iframeContainerId)
        .then(() => {
            return new Promise<InternalCheckoutSelectors>((resolve, reject) => {
                this.modal.open({
                    closeCallback: reject,
                    showCloseButton: false,
                });

                // to be changed later
                window.addEventListener('message', event => {
                    if (event.data === 'closeModal') {
                        this.modal.close();
                        resolve();
                    }
                });

                this._store.dispatch(this._orderActionCreator.submitOrder(payload, options))
                .then(() =>
                    this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payment.methodId, 'barclaycard', `${this._methodId}${iframeSuffix}`))
                );
            });
        });
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (options) {
            // const { methodId } = options;
            // TODO
        }

        return Promise.resolve(this._store.getState());
    }

    private _createPaymentIframe(containerId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const frameContainer = document.getElementById(containerId);

            if (!frameContainer) {
                return reject(new Error('Need a container to insert the iframe'));
            }

            const iframe = document.createElement('iframe');

            iframe.style.border = 'none';
            iframe.style.display = 'none';
            iframe.style.minWidth = '500px';
            iframe.style.minHeight = '450px';
            iframe.name = `${this._methodId}${iframeSuffix}`;
            this.iframe = iframe;
            frameContainer.appendChild(this.iframe);

            this.iframe.addEventListener('load', () => {
                this.iframe.style.display = 'block';
                this._loadingIndicator.hide();
                this.modal.showCloseButton();
            });

            return resolve();
        });
    }
}
