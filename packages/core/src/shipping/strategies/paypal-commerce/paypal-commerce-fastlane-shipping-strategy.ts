import {
    isPayPalCommerceAcceleratedCheckoutCustomer,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceConnectStylesOption,
    PayPalCommerceFastlaneUtils,
    PayPalCommerceSdk,
    PayPalFastlaneAuthenticationState,
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

import PayPalCommerceFastlaneShippingInitializeOptions from './paypal-commerce-fastlane-shipping-initialization-options';

export default class PayPalCommerceFastlaneShippingStrategy implements ShippingStrategy {
    private _isFastlaneEnabled = false;

    constructor(
        private _store: CheckoutStore,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator,
        private _paypalCommerceSdk: PayPalCommerceSdk,
        private _paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils,
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
        options: PayPalCommerceFastlaneShippingInitializeOptions,
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
                const state = await this._store.dispatch(
                    this._paymentMethodActionCreator.loadPaymentMethod(methodId),
                );

                const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

                this._isFastlaneEnabled = !!paymentMethod.initializationData.isFastlaneEnabled;

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

        const paypalConnectSessionId = this._paypalCommerceFastlaneUtils.getStorageSessionId();

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
        const cart = state.cart.getCartOrThrow();

        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (this._isFastlaneEnabled) {
            const paypalFastlaneSdk = await this._paypalCommerceSdk.getPayPalFastlaneSdk(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            await this._paypalCommerceFastlaneUtils.initializePayPalFastlane(
                paypalFastlaneSdk,
                paymentMethod.initializationData.isDeveloperModeApplicable,
                styles,
            );
        } else {
            const paypalAxo = await this._paypalCommerceSdk.getPayPalAxo(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            await this._paypalCommerceFastlaneUtils.initializePayPalConnect(
                paypalAxo,
                paymentMethod.initializationData.isDeveloperModeApplicable,
                styles,
            );
        }
    }

    private async _runAuthenticationFlowOrThrow(methodId: string): Promise<void> {
        try {
            const state = this._store.getState();
            const cart = state.cart.getCartOrThrow();
            const customerEmail = state.customer.getCustomer()?.email;
            const billingAddressEmail = state.billingAddress.getBillingAddress()?.email;
            const email = customerEmail || billingAddressEmail || '';

            const { customerContextId } = this._isFastlaneEnabled
                ? await this._paypalCommerceFastlaneUtils.lookupCustomerOrThrow(email)
                : await this._paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow(email);

            const authenticationResult = this._isFastlaneEnabled
                ? await this._paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow(
                      customerContextId,
                  )
                : await this._paypalCommerceFastlaneUtils.connectTriggerAuthenticationFlowOrThrow(
                      customerContextId,
                  );

            const { authenticationState, addresses, billingAddress, shippingAddress, instruments } =
                this._paypalCommerceFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData(
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
                PayPalFastlaneAuthenticationState.CANCELED;

            this._paypalCommerceFastlaneUtils.updateStorageSessionId(
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
