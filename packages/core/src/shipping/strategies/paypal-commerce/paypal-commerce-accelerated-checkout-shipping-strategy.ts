import {
    isPayPalCommerceAcceleratedCheckoutCustomer,
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceConnectStylesOption,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { AddressRequestBody } from '../../../address';
import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { PaymentProviderCustomerActionCreator } from '../../../payment-provider-customer';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ShippingRequestOptions } from '../../shipping-request-options';
import ShippingStrategy from '../shipping-strategy';

import PayPalCommerceAcceleratedCheckoutShippingInitializeOptions from './paypal-commerce-accelerated-checkout-shipping-initialization-options';

export default class PayPalCommerceAcceleratedCheckoutShippingStrategy implements ShippingStrategy {
    constructor(
        private _store: CheckoutStore,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator,
        private _paypalCommerceSdk: PayPalCommerceSdk,
        private _paypalCommerceAcceleratedCheckoutUtils: PayPalCommerceAcceleratedCheckoutUtils,
    ) {}

    updateAddress(
        address: AddressRequestBody,
        options?: ShippingRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._consignmentActionCreator.updateAddress(address, options));
    }

    selectOption(
        optionId: string,
        options?: ShippingRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.selectShippingOption(optionId, options),
        );
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    async initialize(
        options: PayPalCommerceAcceleratedCheckoutShippingInitializeOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { methodId, styles } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const isAuthenticatedUser = !this._shouldRunAuthenticationFlow();

        if (!isAuthenticatedUser) {
            try {
                await this._store.dispatch(
                    this._paymentMethodActionCreator.loadPaymentMethod(methodId),
                );

                await this._initializePayPalSdk(methodId, styles);
                await this._runAuthenticationFlowOrThrow(methodId);
            } catch (error) {
                // Info: we should not throw any error here to avoid customer stuck on
                // shipping step due to the payment provider custom flow
            }
        }

        return Promise.resolve(this._store.getState());
    }

    private _shouldRunAuthenticationFlow(): boolean {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const paymentProviderCustomer =
            state.paymentProviderCustomer.getPaymentProviderCustomerOrThrow();
        const paypalCommercePaymentProviderCustomer = isPayPalCommerceAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        const paypalConnectSessionId =
            this._paypalCommerceAcceleratedCheckoutUtils.getStorageSessionId();

        if (
            paypalCommercePaymentProviderCustomer?.authenticationState ===
            PayPalCommerceConnectAuthenticationState.CANCELED
        ) {
            return false;
        }

        return (
            !paypalCommercePaymentProviderCustomer?.authenticationState &&
            paypalConnectSessionId === cart.id
        );
    }

    private async _initializePayPalSdk(
        methodId: string,
        styles?: PayPalCommerceConnectStylesOption,
    ): Promise<void> {
        const state = this._store.getState();

        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const currencyCode = state.cart.getCartOrThrow().currency.code;

        const paypalAxo = await this._paypalCommerceSdk.getPayPalAxo(paymentMethod, currencyCode);

        await this._paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect(
            paypalAxo,
            paymentMethod.initializationData.isDeveloperModeApplicable,
            styles,
        );
    }

    private async _runAuthenticationFlowOrThrow(methodId: string): Promise<void> {
        try {
            const state = this._store.getState();
            const cart = state.cart.getCartOrThrow();
            const customerEmail = state.customer.getCustomer()?.email;
            const billingAddressEmail = state.billingAddress.getBillingAddress()?.email;
            const email = customerEmail || billingAddressEmail || '';

            const { customerContextId } =
                await this._paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow(email);

            const authenticationResult =
                await this._paypalCommerceAcceleratedCheckoutUtils.triggerAuthenticationFlowOrThrow(
                    customerContextId,
                );

            const { authenticationState, addresses, billingAddress, shippingAddress, instruments } =
                this._paypalCommerceAcceleratedCheckoutUtils.mapPayPalConnectProfileToBcCustomerData(
                    methodId,
                    authenticationResult,
                );

            await this._store.dispatch(
                this._paymentProviderCustomerActionCreator.updatePaymentProviderCustomer({
                    authenticationState,
                    addresses,
                    instruments,
                }),
            );

            const isAuthenticationFlowCanceled =
                authenticationResult.authenticationState ===
                PayPalCommerceConnectAuthenticationState.CANCELED;

            this._paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId(
                isAuthenticationFlowCanceled,
                cart.id,
            );

            if (billingAddress) {
                await this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress({
                        ...billingAddress,
                        id: String(billingAddress.id),
                    }),
                );
            }

            if (shippingAddress && cart.lineItems.physicalItems.length > 0) {
                await this._store.dispatch(
                    this._consignmentActionCreator.updateAddress(shippingAddress),
                );
            }
        } catch (error) {
            // Info: Do not throw anything here to avoid blocking customer
            // from passing checkout flow
        }
    }
}
