import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { PaypalCommercePaymentProcessor, PaypalCommerceRequestSender } from './index';

export default class PaypalCommercePaymentStrategy implements PaymentStrategy {
    private _approveUrl?: string;

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

        const orderId = paymentMethod.initializationData.orderId || await this._getOrderIdAndShowPopup(options.methodId);

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

        return this._processSubmitPayment({ ...payment, paymentData }, options.methodId);
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paypalCommercePaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private async _getOrderIdAndShowPopup(methodId: string): Promise<string> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const provider = methodId === 'paypalcommercecredit' ? 'paypalcommercecreditcheckout' : 'paypalcommercecheckout';
        const { approveUrl, orderId } = await this._paypalCommerceRequestSender.setupPayment(provider, cart.id);
        this._approveUrl = approveUrl;

        await this._showPopup();

        return orderId;
    }

    private async _showPopup(): Promise<any> {
        if (this._approveUrl) {
            await this._paypalCommercePaymentProcessor.paymentPayPal(this._approveUrl);
        }
    }

    private async _processSubmitPayment(payment: Payment, methodId: string, attempts = 0): Promise<InternalCheckoutSelectors> {
        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment }));
        } catch (error) {
            const isNotTransactionRejected = !(error instanceof RequestError) || !some(error.body.errors, {code: 'transaction_rejected'});

            if (isNotTransactionRejected || attempts > 2) {
                return Promise.reject(error);
            }

            if (!this._approveUrl) {
                await this._getOrderIdAndShowPopup(methodId);
            } else {
                await this._showPopup();
            }

            return this._processSubmitPayment(payment, methodId, ++attempts);
        }
    }
}
