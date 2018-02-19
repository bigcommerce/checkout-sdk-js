/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments-widgets.d.ts" />

import { noop } from 'lodash';
import { Address } from '../../address';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { CheckoutSelectors } from '../../checkout';
import { ReadableDataStore } from '../../../data-store';
import { NotInitializedError } from '../../common/error/errors';
import { PaymentMethod } from '../../payment';
import { RemoteCheckoutAccountInvalidError, RemoteCheckoutSessionError, RemoteCheckoutShippingError } from '../../remote-checkout/errors';
import { isAddressEqual } from '../../address';
import ShippingStrategy from './shipping-strategy';
import UpdateShippingService from '../update-shipping-service';

export default class AmazonPayShippingStrategy extends ShippingStrategy {
    private _addressBook?: OffAmazonPayments.Widgets.AddressBook;
    private _addressBookOptions?: InitializeWidgetOptions;
    private _paymentMethod?: PaymentMethod;
    private _window: OffAmazonPayments.HostWindow;

    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        updateShippingService: UpdateShippingService,
        private _remoteCheckoutService: any,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store, updateShippingService);

        this._window = window;
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        return this._updateShippingService
            .initializeShipping(options.paymentMethod.id, () =>
                new Promise((resolve, reject) => {
                    const { onError = noop, onReady = noop } = options;

                    this._addressBookOptions = options;
                    this._paymentMethod = options.paymentMethod;

                    this._window.onAmazonPaymentsReady = () => {
                        this._addressBook = this._createAddressBook({
                            ...options as InitializeWidgetOptions,
                            onError: (error) => {
                                onError(error);
                                reject(error);
                            },
                            onReady: () => {
                                onReady();
                                resolve();
                            },
                        });
                    };

                    this._scriptLoader.loadWidget(this._paymentMethod)
                        .catch(reject);
                })
            )
            .then(() => super.initialize(options));
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._addressBook = undefined;
        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    updateAddress(address: Address, options?: any): Promise<CheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors> {
        return this._updateShippingService.selectOption(addressId, optionId, options);
    }

    private _createAddressBook(options: InitializeWidgetOptions): OffAmazonPayments.Widgets.AddressBook {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        const { container, onAddressSelect = noop, onError = noop, onReady = noop } = options;
        const { merchantId } = this._paymentMethod.config;

        const widget = new OffAmazonPayments.Widgets.AddressBook({
            design: {
                designMode: 'responsive',
            },
            scope: 'payments:billing_address payments:shipping_address payments:widget profile',
            sellerId: merchantId!,
            onAddressSelect: (orderReference) => {
                this._handleAddressSelect(orderReference, onAddressSelect, onError);
            },
            onError: (error) => {
                this._handleError(error, onError);
            },
            onOrderReferenceCreate: (orderReference) => {
                this._handleOrderReferenceCreate(orderReference);
            },
            onReady: () => onReady(),
        });

        widget.bind(container);

        return widget;
    }

    private _handleAddressSelect(
        orderReference: OffAmazonPayments.Widgets.OrderReference,
        callback: (address: Address) => void,
        errorCallback: (error: Error) => void
    ): void {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon: { referenceId } } } = checkout.getCheckoutMeta();

        this._remoteCheckoutService.synchronizeShippingAddress(this._paymentMethod.id, { referenceId })
            .then(({ checkout }: CheckoutSelectors) => {
                callback(checkout.getShippingAddress());
            })
            .catch((error: Error) => {
                errorCallback(error);
            });
    }

    private _handleOrderReferenceCreate(orderReference: OffAmazonPayments.Widgets.OrderReference): void {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        this._remoteCheckoutService.setCheckoutMeta(this._paymentMethod.id, {
            referenceId: orderReference.getAmazonOrderReferenceId(),
        });
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
    paymentMethod: PaymentMethod;
}

export interface InitializeWidgetOptions {
    container: string;
    onAddressSelect?: (address: Address) => void;
    onError?: (error: Error) => void;
    onReady?: () => void;
}
