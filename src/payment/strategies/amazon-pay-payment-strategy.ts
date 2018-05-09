import { noop, omit } from 'lodash';

import { isAddressEqual, mapFromInternalAddress } from '../../address';
import { BillingAddressActionCreator } from '../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { InvalidArgumentError, MissingDataError, NotInitializedError, RequestError, StandardError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import { RemoteCheckoutActionCreator } from '../../remote-checkout';
import { RemoteCheckoutSynchronizationError } from '../../remote-checkout/errors';
import {
    AmazonPayOrderReference,
    AmazonPayScriptLoader,
    AmazonPayWallet,
    AmazonPayWalletOptions,
    AmazonPayWidgetError,
    AmazonPayWindow,
} from '../../remote-checkout/methods/amazon-pay';
import Payment from '../payment';
import PaymentMethod from '../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../payment-request-options';

import PaymentStrategy from './payment-strategy';

export default class AmazonPayPaymentStrategy extends PaymentStrategy {
    private _paymentMethod?: PaymentMethod;
    private _walletOptions?: AmazonPayPaymentInitializeOptions;
    private _window: AmazonPayWindow;

    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store);

        this._window = window;
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        const { amazon: amazonOptions, methodId } = options;
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!amazonOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.amazon" argument is not provided.');
        }

        if (!paymentMethod) {
            throw new MissingDataError(`Unable to initialize because "paymentMethod (${options.methodId})" data is missing.`);
        }

        this._walletOptions = amazonOptions;
        this._paymentMethod = paymentMethod;

        return new Promise((resolve, reject) => {
            const onReady = () => {
                this._createWallet(amazonOptions)
                    .then(resolve)
                    .catch(reject);
            };

            this._scriptLoader.loadWidget(paymentMethod, onReady)
                .catch(reject);
        })
            .then(() => super.initialize(options));
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._walletOptions = undefined;

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { useStoreCredit = false } = payload;
        const referenceId = this._getOrderReferenceId();

        if (!referenceId) {
            throw new NotInitializedError('Unable to submit payment without order reference ID');
        }

        if (!payload.payment) {
            throw new InvalidArgumentError('Unable to proceed because "payload.payment.name" argument is not provided.');
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializePayment(payload.payment.name, { referenceId, useStoreCredit })
        )
            .then(() => this._store.dispatch(
                this._orderActionCreator.submitOrder({
                    ...payload,
                    payment: omit(payload.payment, 'paymentData') as Payment,
                }, options)
            ))
            .catch(error => {
                if (error instanceof RequestError && error.body.type === 'provider_widget_error' && this._walletOptions) {
                    return this._createWallet(this._walletOptions)
                        .then(() => Promise.reject(error));
                }

                return Promise.reject(error);
            });
    }

    private _getMerchantId(): string | undefined {
        return this._paymentMethod && this._paymentMethod.config.merchantId;
    }

    private _getOrderReferenceId(): string | undefined {
        const state = this._store.getState();
        const meta = state.remoteCheckout.getCheckoutMeta() || {};

        return meta && meta.amazon && meta.amazon.referenceId;
    }

    private _createWallet(options: AmazonPayPaymentInitializeOptions): Promise<AmazonPayWallet> {
        return new Promise((resolve, reject) => {
            const { container, onError = noop, onPaymentSelect = noop, onReady = noop } = options;
            const referenceId = this._getOrderReferenceId();
            const merchantId = this._getMerchantId();

            if (!merchantId || !document.getElementById(container) || !this._window.OffAmazonPayments) {
                return reject(new NotInitializedError('Unable to create AmazonPay Wallet widget without valid merchant ID or container ID.'));
            }

            const walletOptions: AmazonPayWalletOptions = {
                design: { designMode: 'responsive' },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onError: error => {
                    reject(error);
                    onError(error);
                },
                onPaymentSelect: orderReference => {
                    this._synchronizeBillingAddress()
                        .then(() => onPaymentSelect(orderReference))
                        .catch(onError);
                },
                onReady: orderReference => {
                    resolve();
                    onReady(orderReference);
                },
            };

            if (referenceId) {
                walletOptions.amazonOrderReferenceId = referenceId;
            } else {
                walletOptions.onOrderReferenceCreate = orderReference => {
                    if (!this._paymentMethod) {
                        throw new NotInitializedError('Unable to create Amazon wallet because payment method has not been initialized.');
                    }

                    this._store.dispatch(
                        this._remoteCheckoutActionCreator.setCheckoutMeta(this._paymentMethod.id, {
                            referenceId: orderReference.getAmazonOrderReferenceId(),
                        })
                    );
                };
            }

            const widget = new this._window.OffAmazonPayments.Widgets.Wallet(walletOptions);

            widget.bind(container);

            return widget;
        });
    }

    private _synchronizeBillingAddress(): Promise<InternalCheckoutSelectors> {
        const referenceId = this._getOrderReferenceId();
        const methodId = this._paymentMethod && this._paymentMethod.id;

        if (!methodId || !referenceId) {
            throw new RemoteCheckoutSynchronizationError();
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializeBilling(methodId, { referenceId })
        )
            .then(state => {
                const remoteCheckout = state.remoteCheckout.getCheckout();
                const address = state.billingAddress.getBillingAddress();

                if (remoteCheckout && remoteCheckout.billingAddress === false) {
                    throw new RemoteCheckoutSynchronizationError();
                }

                if (!remoteCheckout || !remoteCheckout.billingAddress || isAddressEqual(remoteCheckout.billingAddress, address || {})) {
                    return this._store.getState();
                }

                return this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(
                        mapFromInternalAddress(remoteCheckout.billingAddress)
                    )
                );
            });
    }
}

export interface AmazonPayPaymentInitializeOptions {
    container: string;
    onError?(error: AmazonPayWidgetError | StandardError): void;
    onPaymentSelect?(reference: AmazonPayOrderReference): void;
    onReady?(reference: AmazonPayOrderReference): void;
}
