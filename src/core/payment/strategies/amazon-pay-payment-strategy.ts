/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments-widgets.d.ts" />

import { noop, omit } from 'lodash';
import { Address } from '../../address';
import { OrderRequestBody } from '../../order';
import { RemoteCheckoutPaymentError, RemoteCheckoutSessionError } from '../../remote-checkout/errors';
import Payment from '../payment';
import PaymentStrategy from './payment-strategy';
import PaymentMethod from '../payment-method';
import ReadableDataStore from '../../../data-store/readable-data-store';
import CheckoutSelectors from '../../checkout/checkout-selectors';
import AmazonPayScriptLoader from '../../remote-checkout/methods/amazon-pay/amazon-pay-script-loader';

export default class AmazonPayPaymentStrategy extends PaymentStrategy {
    private _unsubscribe: (() => void) | undefined;
    private _wallet: OffAmazonPayments.Widgets.Wallet | undefined;

    constructor(
        paymentMethod: PaymentMethod,
        store: ReadableDataStore<CheckoutSelectors>,
        placeOrderService: any,
        private _remoteCheckoutService: any,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(paymentMethod, store, placeOrderService);
    }

    initialize(options: any): Promise<CheckoutSelectors> {
        return this._scriptLoader.loadWidget(this._paymentMethod)
            .then(() => {
                this._wallet = this._createWallet(options);

                this._unsubscribe = this._store.subscribe(
                    this._handleGrandTotalChange.bind(this),
                    ({ checkout }) => checkout.getCart() && checkout.getCart().grandTotal
                );

                return super.initialize(options);
            });
    }

    deinitialize(options: any): Promise<CheckoutSelectors> {
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        this._wallet = undefined;

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        const { id } = this._paymentMethod;
        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon: { referenceId } } } = checkout.getCheckoutMeta();

        return this._remoteCheckoutService.initializePayment(id, { referenceId })
            .then(() => this._placeOrderService.submitOrder({
                ...payload,
                payment: omit(payload.payment, 'paymentData'),
            }, options));
    }

    private _createWallet(options: InitializeWidgetOptions): OffAmazonPayments.Widgets.Wallet {
        const { container, onError = noop, onPaymentSelect = noop } = options;
        const { merchantId } = this._paymentMethod.config;

        const widget = new OffAmazonPayments.Widgets.Wallet({
            design: { designMode: 'responsive' },
            scope: 'payments:billing_address payments:shipping_address payments:widget profile',
            sellerId: merchantId!,
            onError: (error) => {
                this._handleError(error, onError);
            },
            onPaymentSelect: (orderReference) => {
                this._handlePaymentSelect(orderReference, onPaymentSelect);
            },
        });

        widget.bind(container);

        return widget;
    }

    private _handlePaymentSelect(orderReference: OffAmazonPayments.Widgets.OrderReference, callback: (address: Address) => void): void {
        const { id } = this._paymentMethod;
        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon: { referenceId } } } = checkout.getCheckoutMeta();

        callback(checkout.getBillingAddress());

        this._remoteCheckoutService.initializePayment(id, { referenceId })
            .then(() => this._remoteCheckoutService.synchronizeBillingAddress(id, { referenceId }))
            .then(({ checkout }: CheckoutSelectors) => callback(checkout.getBillingAddress()));
    }

    private _handleGrandTotalChange({ checkout }: CheckoutSelectors): void {
        const { id } = this._paymentMethod;
        const { remoteCheckout } = checkout.getCheckoutMeta();

        if (!remoteCheckout || !remoteCheckout.amazon || !remoteCheckout.amazon.referenceId) {
            return;
        }

        this._remoteCheckoutService.initializePayment(id, {
            referenceId: remoteCheckout.amazon.referenceId,
        });
    }

    private _handleError(error: OffAmazonPayments.Widgets.WidgetError, callback: (error: Error) => void): void {
        if (!error) {
            return;
        }

        if (error.getErrorCode() === 'BuyerSessionExpired') {
            callback(new RemoteCheckoutSessionError(error));
        } else {
            callback(new RemoteCheckoutPaymentError(error));
        }
    }
}

export interface InitializeWidgetOptions {
    container: string;
    onPaymentSelect?: (address: Address) => void;
    onError?: (error: Error) => void;
}
