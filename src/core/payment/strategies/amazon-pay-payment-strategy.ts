/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments-widgets.d.ts" />

import { noop, omit } from 'lodash';
import { Address } from '../../address';
import { OrderRequestBody } from '../../order';
import { NotInitializedError, RequestError } from '../../common/error/errors';
import { RemoteCheckoutPaymentError, RemoteCheckoutSessionError } from '../../remote-checkout/errors';
import Payment from '../payment';
import PaymentStrategy from './payment-strategy';
import PaymentMethod from '../payment-method';
import ReadableDataStore from '../../../data-store/readable-data-store';
import CheckoutSelectors from '../../checkout/checkout-selectors';
import AmazonPayScriptLoader from '../../remote-checkout/methods/amazon-pay/amazon-pay-script-loader';

export default class AmazonPayPaymentStrategy extends PaymentStrategy {
    private _unsubscribe?: (() => void);
    private _wallet?: OffAmazonPayments.Widgets.Wallet;
    private _walletOptions?: InitializeWidgetOptions;
    private _window: OffAmazonPayments.HostWindow;

    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        placeOrderService: any,
        private _remoteCheckoutService: any,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store, placeOrderService);

        this._window = window;
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        this._walletOptions = options;
        this._paymentMethod = options.paymentMethod;

        return this._placeOrderService
            .initializePaymentMethod(options.paymentMethod.id, () =>
                new Promise((resolve, reject) => {
                    const { onError = noop, onReady = noop } = options;

                    this._window.onAmazonPaymentsReady = () => {
                        this._wallet = this._createWallet({
                            ...options as InitializeWidgetOptions,
                            onError: (error) => {
                                reject(error);
                                onError(error);
                            },
                            onReady: () => {
                                resolve();
                                onReady();
                            },
                        });
                    };

                    this._scriptLoader.loadWidget(options.paymentMethod)
                        .catch(reject);
                })
            )
            .then(() => {
                this._unsubscribe = this._store.subscribe(
                    this._handleGrandTotalChange.bind(this),
                    ({ checkout }) => checkout.getCart() && checkout.getCart().grandTotal
                );

                return super.initialize(options);
            });
    }

    deinitialize(options: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._unsubscribe!();

        this._wallet = undefined;
        this._walletOptions = undefined;
        this._unsubscribe = undefined;

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon: { referenceId } } } = checkout.getCheckoutMeta();

        return this._remoteCheckoutService.initializePayment(payload.payment.name, { referenceId })
            .then(() => this._placeOrderService.submitOrder({
                ...payload,
                payment: omit(payload.payment, 'paymentData'),
            }, options))
            .catch((error: Error) => {
                if (error instanceof RequestError && error.body.type === 'provider_widget_error') {
                    this._wallet = this._refreshWallet();
                }

                return Promise.reject(error);
            });
    }

    private _createWallet(options: InitializeWidgetOptions): OffAmazonPayments.Widgets.Wallet {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        const { container, onError = noop, onPaymentSelect = noop, onReady = noop } = options;
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
            onReady: () => onReady(),
        });

        widget.bind(container);

        return widget;
    }

    private _refreshWallet(): OffAmazonPayments.Widgets.Wallet {
        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon: { referenceId } } } = checkout.getCheckoutMeta();

        return this._createWallet({
            ...this._walletOptions!,
            amazonOrderReferenceId: referenceId,
        });
    }

    private _handlePaymentSelect(orderReference: OffAmazonPayments.Widgets.OrderReference, callback: (address: Address) => void): void {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        const { id } = this._paymentMethod;
        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon: { referenceId } } } = checkout.getCheckoutMeta();

        callback(checkout.getBillingAddress());

        this._remoteCheckoutService.initializePayment(id, { referenceId })
            .then(() => this._remoteCheckoutService.synchronizeBillingAddress(id, { referenceId }))
            .then(({ checkout }: CheckoutSelectors) => callback(checkout.getBillingAddress()));
    }

    private _handleGrandTotalChange({ checkout }: CheckoutSelectors): void {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

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
        if (error.getErrorCode() === 'BuyerSessionExpired') {
            callback(new RemoteCheckoutSessionError(error));
        } else {
            callback(new RemoteCheckoutPaymentError(error));
        }
    }
}

export interface InitializeOptions extends InitializeWidgetOptions {
    paymentMethod: PaymentMethod;
}

export interface InitializeWidgetOptions {
    container: string;
    amazonOrderReferenceId?: string;
    onPaymentSelect?: (address: Address) => void;
    onError?: (error: Error) => void;
    onReady?: () => void;
}
