import { noop } from 'lodash';

import { isInternalAddressEqual, mapFromInternalAddress, mapToInternalAddress } from '../../../address';
import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { RemoteCheckoutSynchronizationError } from '../../../remote-checkout/errors';
import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import AmazonPayConfirmationFlow from './amazon-pay-confirmation-flow';
import AmazonPayOrderReference from './amazon-pay-order-reference';
import AmazonPayPaymentInitializeOptions from './amazon-pay-payment-initialize-options';
import AmazonPayScriptLoader from './amazon-pay-script-loader';
import AmazonPayWallet, { AmazonPayWalletOptions } from './amazon-pay-wallet';
import AmazonPayWindow from './amazon-pay-window';

export default class AmazonPayPaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;
    private _walletOptions?: AmazonPayPaymentInitializeOptions;
    private _window: AmazonPayWindow;
    private _isPaymentMethodSelected: boolean;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        this._window = window;
        this._isPaymentMethodSelected = false;
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
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
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._walletOptions = undefined;

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const referenceId = this._getOrderReferenceId();
        const sellerId = this._getMerchantId();

        if (!referenceId || !sellerId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!payload.payment) {
            throw new InvalidArgumentError('Unable to proceed because "payload.payment.methodId" argument is not provided.');
        }

        if (!this._isPaymentMethodSelected) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { payment: { paymentData, ...paymentPayload }, useStoreCredit = false } = payload;

        if (options && this._paymentMethod && this._paymentMethod.config.is3dsEnabled) {
            return this._processPaymentWith3ds(
                sellerId,
                referenceId,
                paymentPayload.methodId,
                useStoreCredit,
                options
            );
        }

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

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _getMerchantId(): string | undefined {
        return this._paymentMethod && this._paymentMethod.config.merchantId;
    }

    private _getOrderReferenceId(): string | undefined {
        const state = this._store.getState();
        const amazon = state.remoteCheckout.getCheckout('amazon');

        return amazon ? amazon.referenceId : undefined;
    }

    private _getOrderReferenceIdFromInitializationData(): string | undefined {
        return this._paymentMethod ? this._paymentMethod.initializationData.orderReferenceId : undefined;
    }

    private _createWallet(options: AmazonPayPaymentInitializeOptions): Promise<AmazonPayWallet> {
        return new Promise((resolve, reject) => {
            const { container, onError = noop, onPaymentSelect = noop, onReady = noop } = options;
            const referenceId = this._getOrderReferenceId() || this._getOrderReferenceIdFromInitializationData();
            const merchantId = this._getMerchantId();

            if (!document.getElementById(container)) {
                return reject(new InvalidArgumentError('Unable to create AmazonPay Wallet widget without valid container ID.'));
            }

            if (!this._window.OffAmazonPayments) {
                return reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
            }

            if (!merchantId) {
                return reject(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
            }

            const walletOptions: AmazonPayWalletOptions = {
                amazonOrderReferenceId: referenceId,
                design: { designMode: 'responsive' },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onError: error => {
                    reject(error);
                    onError(error);
                },
                onPaymentSelect: orderReference => {
                    this._synchronizeBillingAddress()
                        .then(() => {
                            this._isPaymentMethodSelected = true;
                            onPaymentSelect(orderReference);
                        })
                        .catch(onError);
                },
                onReady: orderReference => {
                    resolve();
                    onReady(orderReference);
                },
            };

            if (!this._getOrderReferenceId()) {
                walletOptions.onReady = orderReference => {
                    this._updateOrderReference(orderReference)
                        .then(() => {
                            resolve();
                            onReady(orderReference);
                        })
                        .catch(onError);
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

                if (!remoteAddress || isInternalAddressEqual(remoteAddress, internalBillingAddress || {})) {
                    return this._store.getState();
                }

                return this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(mapFromInternalAddress(remoteAddress))
                );
            });
    }

    private _updateOrderReference(orderReference: AmazonPayOrderReference): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._remoteCheckoutActionCreator.updateCheckout('amazon', {
                referenceId: orderReference.getAmazonOrderReferenceId(),
            })
        );
    }

    private _processPaymentWith3ds(sellerId: string, referenceId: string, methodId: string, useStoreCredit: boolean, options: PaymentRequestOptions): Promise<never> {
        return new Promise((_, reject) => {
            if (!this._window.OffAmazonPayments) {
                return reject(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
            }

            return this._window.OffAmazonPayments.initConfirmationFlow(
                sellerId,
                referenceId,
                (confirmationFlow: AmazonPayConfirmationFlow) => {
                    return this._store.dispatch(
                        this._orderActionCreator.submitOrder({useStoreCredit}, options)
                    )
                        .then(() => this._store.dispatch(
                            this._remoteCheckoutActionCreator.initializePayment(methodId, {
                                referenceId,
                                useStoreCredit,
                            }))
                        )
                        .then(() => {
                            confirmationFlow.success();

                            return new Promise<never>(() => {});
                        })
                        .catch(error => {
                            confirmationFlow.error();

                            return reject(error);
                        });
                }
            );
        });
    }
}
