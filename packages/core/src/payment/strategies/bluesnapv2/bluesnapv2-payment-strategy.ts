import { noop } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { CancellablePromise } from '../../../common/utility';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import * as paymentStatusTypes from '../../payment-status-types';
import PaymentStrategy from '../payment-strategy';

import { BlueSnapV2StyleProps } from './bluesnapv2';
import { BlueSnapV2PaymentInitializeOptions } from './bluesnapv2-payment-options';

const IFRAME_NAME = 'bluesnapv2_hosted_payment_page';

export default class BlueSnapV2PaymentStrategy implements PaymentStrategy {

    private _initializeOptions?: BlueSnapV2PaymentInitializeOptions;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    async execute(orderRequest: OrderRequestBody, options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this._initializeOptions) {
            throw new NotInitializedError(
                NotInitializedErrorType.PaymentNotInitialized
            );
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(orderRequest, options));

        const { onLoad, style } = this._initializeOptions;
        const frame = this._createIframe(IFRAME_NAME, style);
        const promise = new CancellablePromise<undefined>(new Promise(noop));

        onLoad(frame, () => promise.cancel(new PaymentMethodCancelledError()));

        return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment({
            methodId: payment.methodId,
            gatewayId: payment.gatewayId,
            shouldSaveInstrument: false,
            target: frame.name,
            promise: promise.promise,
        }));
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();
        const status = state.payment.getPaymentStatus();

        if (order && (status === paymentStatusTypes.ACKNOWLEDGE || status === paymentStatusTypes.FINALIZE)) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._initializeOptions = options && options.bluesnapv2;

        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private _createIframe(name: string, style?: BlueSnapV2StyleProps): HTMLIFrameElement {
        const iframe = document.createElement('iframe');

        iframe.name = name;

        if (style) {
            const { border, height, width } = style;

            iframe.style.border = border as string;
            iframe.style.height = height as string;
            iframe.style.width = width as string;
        }

        return iframe;
    }
}
