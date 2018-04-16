/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments-widgets.d.ts" />
import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { isAddressEqual, InternalAddress } from '../../address';
import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { NotInitializedError } from '../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { RemoteCheckoutActionCreator } from '../../remote-checkout';
import {
    RemoteCheckoutAccountInvalidError,
    RemoteCheckoutSessionError,
    RemoteCheckoutShippingError,
    RemoteCheckoutSynchronizationError,
} from '../../remote-checkout/errors';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import ShippingAddressActionCreator from '../shipping-address-action-creator';
import ShippingOptionActionCreator from '../shipping-option-action-creator';
import { ShippingStrategyActionType } from '../shipping-strategy-actions';

import ShippingStrategy from './shipping-strategy';

export default class AmazonPayShippingStrategy extends ShippingStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _addressActionCreator: ShippingAddressActionCreator,
        private _optionActionCreator: ShippingOptionActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId))
            .then(({ checkout }) => new Promise((resolve, reject) => {
                this._paymentMethod = checkout.getPaymentMethod(options.methodId);

                const onReady = () => {
                    this._createAddressBook(options)
                        .then(resolve)
                        .catch(reject);
                };

                this._scriptLoader.loadWidget(this._paymentMethod!, onReady)
                    .catch(reject);
            }))
            .then(() => super.initialize(options));
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    updateAddress(address: InternalAddress, options?: any): Promise<CheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._optionActionCreator.selectShippingOption(addressId, optionId, options)
        );
    }

    private _createAddressBook(options: InitializeWidgetOptions): Promise<OffAmazonPayments.Widgets.AddressBook> {
        return new Promise((resolve, reject) => {
            const { container, onAddressSelect = () => {}, onError = () => {}, onReady = () => {} } = options;
            const merchantId = this._paymentMethod && this._paymentMethod.config.merchantId;

            if (!merchantId || !document.getElementById(container)) {
                return reject(new NotInitializedError('Unable to create AmazonPay AddressBook widget without valid merchant ID or container ID.'));
            }

            const widget = new OffAmazonPayments.Widgets.AddressBook({
                design: {
                    designMode: 'responsive',
                },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onAddressSelect: orderReference => {
                    this._handleAddressSelect(orderReference, onAddressSelect, onError);
                },
                onError: error => {
                    reject(error);
                    this._handleError(error, onError);
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

    private _synchronizeShippingAddress(): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon: { referenceId } } } = checkout.getCheckoutMeta();
        const methodId = this._paymentMethod && this._paymentMethod.id;

        if (!methodId || !referenceId) {
            throw new NotInitializedError();
        }

        return this._store.dispatch(
            createAction(ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId })
        )
            .then(() => this._store.dispatch(
                this._remoteCheckoutActionCreator.initializeShipping(methodId, { referenceId })
            ))
            .then(({ checkout }) => {
                const { remoteCheckout = {} } = checkout.getCheckoutMeta();

                if (remoteCheckout.shippingAddress === false) {
                    throw new RemoteCheckoutSynchronizationError();
                }

                if (isAddressEqual(remoteCheckout.shippingAddress, checkout.getShippingAddress()!)) {
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

    private _handleAddressSelect(
        orderReference: OffAmazonPayments.Widgets.OrderReference,
        callback: (address: InternalAddress) => void,
        errorCallback: (error: Error) => void
    ): void {
        this._synchronizeShippingAddress()
            .then(({ checkout }: CheckoutSelectors) => {
                callback(checkout.getShippingAddress()!);
            })
            .catch((error: Error) => {
                errorCallback(error);
            });
    }

    private _handleOrderReferenceCreate(orderReference: OffAmazonPayments.Widgets.OrderReference): void {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        this._store.dispatch(
            this._remoteCheckoutActionCreator.setCheckoutMeta(this._paymentMethod.id, {
                referenceId: orderReference.getAmazonOrderReferenceId(),
            })
        );
    }

    private _handleError(error: OffAmazonPayments.Widgets.WidgetError, callback: (error: Error) => void): void {
        if (error.getErrorCode() === 'BuyerSessionExpired') {
            callback(new RemoteCheckoutSessionError(error));
        } else if (error.getErrorCode() === 'InvalidAccountStatus') {
            callback(new RemoteCheckoutAccountInvalidError(error));
        } else {
            callback(new RemoteCheckoutShippingError(error));
        }
    }
}

export interface InitializeOptions extends InitializeWidgetOptions {
    methodId: string;
}

export interface InitializeWidgetOptions {
    container: string;
    onAddressSelect?: (address: InternalAddress) => void;
    onError?: (error: Error) => void;
    onReady?: () => void;
}
