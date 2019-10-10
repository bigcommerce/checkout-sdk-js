import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import LoadingIndicator from '../../../embedded-checkout/loading-indicator';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { iframeSuffix } from './barclaycard';
import BarclaycardPaymentInitializeOptions from './barclaycard-payment-initialize-options';

export default class BarclaycardPaymentStrategy implements PaymentStrategy {
    private _initializationOptions?: BarclaycardPaymentInitializeOptions;
    private _methodId!: string;
    private _iframe!: HTMLIFrameElement;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _loadingIndicator: LoadingIndicator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;
        const { barclaycard } = options;
        if (!barclaycard) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.modal" argument is not provided.');
        }

        this._initializationOptions = barclaycard;

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment} = payload;
        const orderPayload = payload;

        if (!this._initializationOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.modal" argument is not provided.');
        }
        const { iframeContainerId, setModalStatus } = this._initializationOptions;



        setModalStatus(true);

        const container = document.getElementById(iframeContainerId);

        if (!container) {
            throw new Error('Need a container to insert the iframe');
        }

        this._loadingIndicator.show(iframeContainerId);

        return this._createPaymentIframe(iframeContainerId)
        .then(() => {
            if (!payment) {
                throw new PaymentArgumentInvalidError([this._methodId]);
            }

            return new Promise<InternalCheckoutSelectors>((_resolve, _reject) => {

                this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, options))
                .then(() =>
                    this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payment.methodId, payment.gatewayId, `${this._methodId}${iframeSuffix}`))
                );
            });
        });
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (options) {
            const { methodId } = options;
            /**
             * Check if the method we are trying to deinitialize is the same as the initialized one,
             * by checking this, we prevent the deinitialization of a different method that may have
             * been already initialized by this strategy.
             */
            if (methodId === this._methodId) {
                this._initializationOptions = undefined;
            }
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
            iframe.style.width = '100%';
            iframe.name = `${this._methodId}${iframeSuffix}`;
            this._iframe = iframe;
            frameContainer.appendChild(this._iframe);

            this._iframe.onload = () => {
                this._iframe.style.display = 'block';
                this._loadingIndicator.hide();
            };

            return resolve();
        });
    }
}
