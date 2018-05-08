import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { isAddressEqual, InternalAddress } from '../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { InvalidArgumentError, MissingDataError, NotInitializedError, StandardError } from '../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { RemoteCheckoutActionCreator } from '../../remote-checkout';
import { RemoteCheckoutSynchronizationError } from '../../remote-checkout/errors';
import { AmazonPayAddressBook, AmazonPayOrderReference, AmazonPayScriptLoader, AmazonPayWidgetError, AmazonPayWindow } from '../../remote-checkout/methods/amazon-pay';
import ShippingAddressActionCreator from '../shipping-address-action-creator';
import ShippingOptionActionCreator from '../shipping-option-action-creator';
import { ShippingInitializeOptions, ShippingRequestOptions } from '../shipping-request-options';
import { ShippingStrategyActionType } from '../shipping-strategy-actions';

import ShippingStrategy from './shipping-strategy';

export default class AmazonPayShippingStrategy extends ShippingStrategy {
    private _paymentMethod?: PaymentMethod;
    private _window: AmazonPayWindow;

    constructor(
        store: CheckoutStore,
        private _addressActionCreator: ShippingAddressActionCreator,
        private _optionActionCreator: ShippingOptionActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store);

        this._window = window;
    }

    initialize(options: ShippingInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        const { amazon: amazonOptions, methodId } = options;

        if (!amazonOptions || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "options.amazon" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => new Promise((resolve, reject) => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod) {
                    throw new MissingDataError(`Unable to initialize because "paymentMethod (${methodId})" data is missing.`);
                }

                const onReady = () => {
                    this._createAddressBook(amazonOptions)
                        .then(resolve)
                        .catch(reject);
                };

                this._scriptLoader.loadWidget(this._paymentMethod, onReady)
                    .catch(reject);
            }))
            .then(() => super.initialize(options));
    }

    deinitialize(options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    updateAddress(address: InternalAddress, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    selectOption(addressId: string, optionId: string, options?: any): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._optionActionCreator.selectShippingOption(addressId, optionId, options)
        );
    }

    private _createAddressBook(options: AmazonPayShippingInitializeOptions): Promise<AmazonPayAddressBook> {
        return new Promise((resolve, reject) => {
            const { container, onAddressSelect = () => {}, onError = () => {}, onReady = () => {} } = options;
            const merchantId = this._paymentMethod && this._paymentMethod.config.merchantId;

            if (!merchantId || !document.getElementById(container) || !this._window.OffAmazonPayments) {
                return reject(new NotInitializedError('Unable to create AmazonPay AddressBook widget without valid merchant ID or container ID.'));
            }

            const widget = new this._window.OffAmazonPayments.Widgets.AddressBook({
                design: {
                    designMode: 'responsive',
                },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onAddressSelect: orderReference => {
                    this._synchronizeShippingAddress()
                        .then(() => onAddressSelect(orderReference))
                        .catch(onError);
                },
                onError: error => {
                    reject(error);
                    onError(error);
                },
                onOrderReferenceCreate: orderReference => {
                    this._handleOrderReferenceCreate(orderReference);
                },
                onReady: () => {
                    resolve();
                    onReady();
                },
            });

            widget.bind(container);

            return widget;
        });
    }

    private _synchronizeShippingAddress(): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const meta = state.remoteCheckout.getCheckoutMeta();
        const methodId = this._paymentMethod && this._paymentMethod.id;
        const referenceId = meta && meta.amazon && meta.amazon.referenceId;

        if (!methodId || !referenceId) {
            throw new NotInitializedError();
        }

        return this._store.dispatch(
            createAction(ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId })
        )
            .then(() => this._store.dispatch(
                this._remoteCheckoutActionCreator.initializeShipping(methodId, { referenceId })
            ))
            .then(state => {
                const remoteCheckout = state.remoteCheckout.getCheckout();
                const address = state.shippingAddress.getShippingAddress();

                if (remoteCheckout && remoteCheckout.shippingAddress === false) {
                    throw new RemoteCheckoutSynchronizationError();
                }

                if (!remoteCheckout || !remoteCheckout.shippingAddress || isAddressEqual(remoteCheckout.shippingAddress, address || {})) {
                    return this._store.getState();
                }

                return this._store.dispatch(
                    this._addressActionCreator.updateAddress(remoteCheckout.shippingAddress)
                );
            })
            .then(() => this._store.dispatch(
                createAction(ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId })
            ))
            .catch(error => this._store.dispatch(
                createErrorAction(ShippingStrategyActionType.UpdateAddressFailed, error, { methodId })
            ));
    }

    private _handleOrderReferenceCreate(orderReference: AmazonPayOrderReference): void {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        this._store.dispatch(
            this._remoteCheckoutActionCreator.setCheckoutMeta(this._paymentMethod.id, {
                referenceId: orderReference.getAmazonOrderReferenceId(),
            })
        );
    }
}

export interface AmazonPayShippingInitializeOptions {
    container: string;
    onAddressSelect?(reference: AmazonPayOrderReference): void;
    onError?(error: AmazonPayWidgetError | StandardError): void;
    onReady?(): void;
}
