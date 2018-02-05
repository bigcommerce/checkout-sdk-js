/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments-widgets.d.ts" />

import { noop } from 'lodash';
import { Address } from '../../address';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { NotInitializedError } from '../../common/error/errors';
import { PaymentMethod } from '../../payment';
import { ReadableDataStore } from '../../../data-store';
import { RemoteCheckoutAccountInvalidError, RemoteCheckoutSessionError, RemoteCheckoutShippingError } from '../../remote-checkout/errors';
import { isAddressEqual } from '../../address';
import CheckoutSelectors from '../../checkout/checkout-selectors';
import ShippingStrategy from './shipping-strategy';
import UpdateShippingService from '../update-shipping-service';

export default class AmazonPayShippingStrategy extends ShippingStrategy {
    private _addressBook: OffAmazonPayments.Widgets.AddressBook | undefined;
    private _paymentMethod: PaymentMethod | undefined;

    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        updateShippingService: UpdateShippingService,
        private _remoteCheckoutService: any,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store, updateShippingService);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        this._paymentMethod = options.paymentMethod;

        (window as any).onAmazonPaymentsReady = () => {
            this._addressBook = this._createAddressBook(options);
        };

        return this._scriptLoader.loadWidget(this._paymentMethod)
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

        const { container, onAddressSelect = noop, onError = noop } = options;
        const { merchantId } = this._paymentMethod.config;

        const widget = new OffAmazonPayments.Widgets.AddressBook({
            design: {
                designMode: 'responsive',
            },
            scope: 'payments:billing_address payments:shipping_address payments:widget profile',
            sellerId: merchantId!,
            onAddressSelect: (billingAgreement) => {
                this._handleAddressSelect(billingAgreement, onAddressSelect);
            },
            onError: (error) => {
                this._handleError(error, onError);
            },
            onOrderReferenceCreate: (orderReference) => {
                this._handleOrderReferenceCreate(orderReference);
            },
        });

        widget.bind(container);

        return widget;
    }

    private _handleAddressSelect(orderReference: OffAmazonPayments.Widgets.BillingAgreement, callback: (address: Address) => void): void {
        if (!this._paymentMethod) {
            return;
        }

        const { checkout } = this._store.getState();
        const { remoteCheckout: { amazon: { referenceId } } } = checkout.getCheckoutMeta();

        this._remoteCheckoutService.synchronizeShippingAddress(this._paymentMethod.id, { referenceId })
            .then(({ checkout }: any) => {
                callback(checkout.getShippingAddress());
            });
    }

    private _handleOrderReferenceCreate(orderReference: OffAmazonPayments.Widgets.OrderReference): void {
        if (!this._paymentMethod) {
            return;
        }

        this._remoteCheckoutService.setCheckoutMeta(this._paymentMethod.id, {
            referenceId: orderReference.getAmazonOrderReferenceId(),
        });
    }

    private _handleError(error: OffAmazonPayments.Widgets.WidgetError, callback: (error: Error) => void) {
        if (!error) {
            return;
        }

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
}
