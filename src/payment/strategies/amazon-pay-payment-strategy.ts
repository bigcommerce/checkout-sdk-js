/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments-widgets.d.ts" />

import { noop, omit } from 'lodash';
import { ReadableDataStore } from '@bigcommerce/data-store';
import { InternalAddress } from '../../address';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { CheckoutSelectors } from '../../checkout';
import { NotInitializedError, RequestError } from '../../common/error/errors';
import { OrderRequestBody, PlaceOrderService } from '../../order';
import { RemoteCheckoutPaymentError, RemoteCheckoutSessionError } from '../../remote-checkout/errors';
import { RemoteCheckoutService } from '../../remote-checkout';
import Payment from '../payment';
import PaymentMethod from '../payment-method';
import PaymentStrategy from './payment-strategy';

export default class AmazonPayPaymentStrategy extends PaymentStrategy {
    private _wallet?: OffAmazonPayments.Widgets.Wallet;
    private _walletOptions?: InitializeWidgetOptions;
    private _window: OffAmazonPayments.HostWindow;

    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        placeOrderService: PlaceOrderService,
        private _remoteCheckoutService: RemoteCheckoutService,
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
            .initializePaymentMethod(this._paymentMethod.id, () =>
                new Promise((resolve, reject) => {
                    this._window.onAmazonPaymentsReady = () => {
                        this._createWallet(options)
                            .then((wallet) => {
                                this._wallet = wallet;
                                resolve();
                            })
                            .catch(reject);
                    };

                    this._scriptLoader.loadWidget(options.paymentMethod)
                        .catch(reject);
                })
            )
            .then(() => super.initialize(options));
    }

    deinitialize(options: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._wallet = undefined;
        this._walletOptions = undefined;

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        const { useStoreCredit = false } = payload;
        const referenceId = this._getOrderReferenceId();

        if (!referenceId) {
            throw new NotInitializedError('Unable to submit payment without order reference ID');
        }

        return this._remoteCheckoutService.initializePayment(payload.payment.name, { referenceId, useStoreCredit })
            .then(() =>
                this._placeOrderService.submitOrder({
                    ...payload,
                    payment: omit(payload.payment, 'paymentData'),
                }, true, options)
            )
            .catch((error: Error) => {
                if (error instanceof RequestError && error.body.type === 'provider_widget_error' && this._walletOptions) {
                    return this._createWallet(this._walletOptions)
                        .then((wallet) => {
                            this._wallet = wallet;

                            return Promise.reject(error);
                        });
                }

                return Promise.reject(error);
            });
    }

    private _getMerchantId(): string | undefined {
        return this._paymentMethod && this._paymentMethod.config.merchantId;
    }

    private _getOrderReferenceId(): string | undefined {
        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon = {} } = {} } = checkout.getCheckoutMeta();

        return amazon.referenceId;
    }

    private _createWallet(options: InitializeWidgetOptions): Promise<OffAmazonPayments.Widgets.Wallet> {
        return new Promise((resolve, reject) => {
            const { container, onError = noop, onPaymentSelect = noop, onReady = noop } = options;
            const referenceId = this._getOrderReferenceId();
            const merchantId = this._getMerchantId();

            if (!merchantId || !document.getElementById(container)) {
                return reject(new NotInitializedError('Unable to create AmazonPay Wallet widget without valid merchant ID or container ID.'));
            }

            const walletOptions: OffAmazonPayments.Widgets.WalletOptions = {
                design: { designMode: 'responsive' },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onError: (error) => {
                    reject(error);
                    this._handleError(error, onError);
                },
                onPaymentSelect: (orderReference) => {
                    this._handlePaymentSelect(orderReference, onPaymentSelect);
                },
                onReady: () => {
                    resolve();
                    onReady();
                },
            };

            if (referenceId) {
                walletOptions.amazonOrderReferenceId = referenceId;
            } else {
                walletOptions.onOrderReferenceCreate = (orderReference) => {
                    this._remoteCheckoutService.setCheckoutMeta(this._paymentMethod!.id, {
                        referenceId: orderReference.getAmazonOrderReferenceId(),
                    });
                };
            }

            const widget = new OffAmazonPayments.Widgets.Wallet(walletOptions);

            widget.bind(container);

            return widget;
        });
    }

    private _handlePaymentSelect(orderReference: OffAmazonPayments.Widgets.OrderReference, callback: (address: InternalAddress) => void): void {
        const referenceId = this._getOrderReferenceId();

        if (!this._paymentMethod || !referenceId) {
            throw new NotInitializedError();
        }

        this._remoteCheckoutService.synchronizeBillingAddress(this._paymentMethod.id, { referenceId })
            .then(({ checkout }: CheckoutSelectors) => callback(checkout.getBillingAddress()));
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
    onPaymentSelect?: (address: InternalAddress) => void;
    onError?: (error: Error) => void;
    onReady?: () => void;
}
