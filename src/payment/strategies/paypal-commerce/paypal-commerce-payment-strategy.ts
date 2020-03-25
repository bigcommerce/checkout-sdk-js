import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { PaypalCommercePaymentProcessor, PaypalCommerceRequestSender } from './index';

export default class PaypalCommercePaymentStrategy implements PaymentStrategy {

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor
    ) {}

    initialize({ paypalcommerce }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._paypalCommercePaymentProcessor.initialize({ overlay: paypalcommerce && paypalcommerce.overlay });

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const orderId = paymentMethod.initializationData.orderId || await this._getOrderId();

        const paymentData =  {
            formattedPayload: {
                vault_payment_instrument: null,
                device_info: null,
                paypal_account: {
                    order_id: orderId,
                },
            },
        };

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        return this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paypalCommercePaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private async _getOrderId(): Promise<string> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const { approveUrl, orderId } = await this._paypalCommerceRequestSender.setupPayment(cart.id);

        await this._paypalCommercePaymentProcessor.paymentPayPal(approveUrl);

        return orderId;
    }
}
