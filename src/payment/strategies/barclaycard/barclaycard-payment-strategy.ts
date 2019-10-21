import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { Modal } from '../../../common/modal/';
import { bindDecorator as bind } from '../../../common/utility';
import LoadingIndicator from '../../../embedded-checkout/loading-indicator';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { containerSuffix, iframeSuffix } from './barclaycard';

export default class BarclaycardPaymentStrategy implements PaymentStrategy {
    private _methodId!: string;
    private iframe!: HTMLIFrameElement;
    private loadingIndicator: LoadingIndicator;
    private modal!: Modal;
    private useModal: boolean = false;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
    ) {
        this.loadingIndicator = new LoadingIndicator();
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;

        this.useModal = this._shouldUseModal(this._methodId);

        if (this.useModal) {
            this.modal = new Modal({
                style: { },
                contentsId: `${this._methodId}${containerSuffix}`,
            });
        }

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this.useModal) {
            return this._modalExecution(payload, options);
        }

        return this._offsiteExecution(payload, options);
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this.modal) {
            this.modal.unmount();
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
            iframe.id = iframe.name;
            this.iframe = iframe;
            frameContainer.appendChild(this.iframe);

            this.iframe.addEventListener('load', this._iframeListener);

            return resolve();
        });
    }

    @bind
    private _iframeListener(): void {
        this.iframe.style.display = 'block';
        this.loadingIndicator.hide();
        this.modal.showCloseButton();
    }

    private _shouldUseModal(methodId: string): boolean {
        const modalEnabledMethods = ['Card'];

        return modalEnabledMethods.indexOf(methodId) >= 0;

    }

    private _offsiteExecution(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError([this._methodId]);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payment.methodId, payment.gatewayId))
            );
    }

    private _modalExecution(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;
        const iframeContainerId = `${this._methodId}${containerSuffix}`;
        const targetName = `${this._methodId}${iframeSuffix}`;

        if (!payment) {
            throw new PaymentArgumentInvalidError([this._methodId]);
        }

        return this._createPaymentIframe(iframeContainerId)
            .then(() => {
                return new Promise<InternalCheckoutSelectors>((resolve, reject) => {
                    this.loadingIndicator.show(iframeContainerId);
                    this.modal.open({
                        closeCallback: () => {
                            const frameContainer = document.getElementById(iframeContainerId);
                            if (this.iframe && frameContainer) {
                                this.iframe.removeEventListener('load', this._iframeListener);
                                frameContainer.removeChild(this.iframe);
                            }
                            reject(new PaymentMethodCancelledError());
                        },
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
                    .then(() => {
                        this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payment.methodId, payment.gatewayId, targetName, true));
                    });
                });
            });
    }
}
