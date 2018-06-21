import { noop } from 'lodash';

import { isAddressEqual, mapFromInternalAddress, mapToInternalAddress } from '../../address';
import { BillingAddressActionCreator } from '../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, RequestError, StandardError } from '../../common/error/errors';
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
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
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
        const referenceId = this._getOrderReferenceId();

        if (!referenceId) {
            throw new NotInitializedError('Unable to submit payment without order reference ID');
        }

        if (!payload.payment) {
            throw new InvalidArgumentError('Unable to proceed because "payload.payment.methodId" argument is not provided.');
        }

        const { payment: { paymentData, ...paymentPayload }, useStoreCredit = false } = payload;

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializePayment(paymentPayload.methodId, { referenceId, useStoreCredit })
        )
            .then(() => this._store.dispatch(
                this._orderActionCreator.submitOrder({
                    ...payload,
                    payment: paymentPayload,
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
        const amazon = state.remoteCheckout.getCheckout('amazon');

        return amazon ? amazon.referenceId : undefined;
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
                        this._remoteCheckoutActionCreator.updateCheckout(this._paymentMethod.id as 'amazon', {
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
                const amazon = state.remoteCheckout.getCheckout('amazon');
                const remoteAddress = amazon && amazon.billing && amazon.billing.address;
                const billingAddress = state.billingAddress.getBillingAddress();
                const internalBillingAddress = billingAddress && mapToInternalAddress(billingAddress);

                if (remoteAddress === false) {
                    throw new RemoteCheckoutSynchronizationError();
                }

                if (!remoteAddress || isAddressEqual(remoteAddress, internalBillingAddress || {})) {
                    return this._store.getState();
                }

                return this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(mapFromInternalAddress(remoteAddress))
                );
            });
    }
}

/**
 * A set of options that are required to initialize the Amazon Pay payment
 * method.
 *
 * When AmazonPay is initialized, a widget will be inserted into the DOM. The
 * widget has a list of payment options for the customer to choose from.
 */
export interface AmazonPayPaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    container: string;

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the payment options.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;

    /**
     * A callback that gets called when the customer selects one of the payment
     * options provided by the widget.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onPaymentSelect?(reference: AmazonPayOrderReference): void;

    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onReady?(reference: AmazonPayOrderReference): void;
}
