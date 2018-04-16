/// <reference path="../../remote-checkout/methods/afterpay/afterpay-sdk.d.ts" />

import { CartActionCreator } from '../../cart';
import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { InvalidArgumentError, MissingDataError, NotInitializedError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import { RemoteCheckoutActionCreator } from '../../remote-checkout';
import AfterpayScriptLoader from '../../remote-checkout/methods/afterpay';
import PaymentActionCreator from '../payment-action-creator';
import PaymentMethod from '../payment-method';
import PaymentMethodActionCreator from '../payment-method-action-creator';

import PaymentStrategy, { InitializeOptions } from './payment-strategy';

export default class AfterpayPaymentStrategy extends PaymentStrategy {
    private _afterpaySdk?: Afterpay.Sdk;

    constructor(
        store: CheckoutStore,
        private _cartActionCreator: CartActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _afterpayScriptLoader: AfterpayScriptLoader
    ) {
        super(store);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        return this._afterpayScriptLoader.load(options.paymentMethod)
            .then(afterpaySdk => {
                this._afterpaySdk = afterpaySdk;
            })
            .then(() => super.initialize(options));
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        const paymentId = payload.payment && payload.payment.gateway;

        if (!paymentId) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment.gateway" argument is not provided.');
        }

        const useStoreCredit = !!payload.useStoreCredit;
        const customerMessage = payload.customerMessage ? payload.customerMessage : '';

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializePayment(paymentId, { useStoreCredit, customerMessage })
        )
            .then(({ checkout }) => this._store.dispatch(
                this._cartActionCreator.verifyCart(checkout.getCart(), options)
            ))
            .then(() => this._store.dispatch(
                this._paymentMethodActionCreator.loadPaymentMethod(paymentId, options)
            ))
            .then(({ checkout }) => this._displayModal(checkout.getPaymentMethod(paymentId)))
            // Afterpay will handle the rest of the flow so return a promise that doesn't really resolve
            .then(() => new Promise<never>(() => {}));
    }

    finalize(options: any): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const customer = checkout.getCustomer();
        const order = checkout.getOrder();

        if (!order || !order.payment.id || !customer) {
            throw new MissingDataError('Unable to finalize order because "order" or "customer" data is missing.');
        }

        const { useStoreCredit, customerMessage } = customer.remote;
        const orderPayload = { useStoreCredit, customerMessage };
        const paymentPayload = {
            name: order.payment.id,
            paymentData: { nonce: options.nonce },
        };

        return this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, true, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload))
            );
    }

    private _displayModal(paymentMethod?: PaymentMethod): void {
        if (!this._afterpaySdk || !paymentMethod || !paymentMethod.clientToken) {
            throw new NotInitializedError('Unable to display payment modal because payment method has not been initialized.');
        }

        this._afterpaySdk.init();
        this._afterpaySdk.display({ token: paymentMethod.clientToken });
    }
}
