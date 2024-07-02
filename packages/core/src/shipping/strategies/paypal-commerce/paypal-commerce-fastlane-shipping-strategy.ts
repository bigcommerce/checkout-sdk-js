import { CustomerAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getFastlaneStyles,
    isPayPalCommerceAcceleratedCheckoutCustomer,
    isPayPalFastlaneCustomer,
    PayPalCommerceFastlaneUtils,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneStylesOption,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { AddressRequestBody } from '../../../address';
import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { PaymentProviderCustomerActionCreator } from '../../../payment-provider-customer';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ShippingInitializeOptions, ShippingRequestOptions } from '../../shipping-request-options';
import ShippingStrategy from '../shipping-strategy';

export default class PayPalCommerceFastlaneShippingStrategy implements ShippingStrategy {
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

    async initialize(options: ShippingInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, paypalcommercefastlane } = options || {};
        const { onPayPalFastlaneAddressChange, styles } = paypalcommercefastlane || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const state = this._store.getState();
        const customer = state.customer.getCustomerOrThrow();

        if (!customer?.isGuest) {
            return Promise.resolve(this._store.getState());
        }

        try {
            if (this._shouldAuthenticateUserWithFastlane()) {
                await this._initializePayPalSdk(methodId, styles);
                await this._authenticateUserWithFastlaneOtp(methodId);
            }

            if (
                typeof onPayPalFastlaneAddressChange === 'function' &&
                this._shouldUsePayPalFastlaneShippingComponent()
            ) {
                await this._initializePayPalSdk(methodId, styles);
                onPayPalFastlaneAddressChange(() => this._handlePayPalShippingAddressChange());
            }
        } catch (error) {
            // Info: we should not throw any error here to avoid customer stuck on
            // shipping step due to the payment provider custom flow
        }

        return Promise.resolve(this._store.getState());
    }

    private async _getPayPalPaymentMethodOrThrow(
        methodId: string,
    ): Promise<PaymentMethod<PayPalCommerceInitializationData>> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!paymentMethod) {
            const newState = await this._store.dispatch(
                this._paymentMethodActionCreator.loadPaymentMethod(methodId),
            );

            return newState.paymentMethods.getPaymentMethodOrThrow(methodId);
        }

        return paymentMethod;
    }

    private _getPayPalCustomerAuthenticationState(): string | undefined {
        const state = this._store.getState();
        const paymentProviderCustomer =
            state.paymentProviderCustomer.getPaymentProviderCustomerOrThrow();
        const paypalCommercePaymentProviderCustomer = isPayPalCommerceAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        return paypalCommercePaymentProviderCustomer.authenticationState;
    }

    private _shouldAuthenticateUserWithFastlane(): boolean {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const paypalConnectSessionId = this._paypalCommerceFastlaneUtils.getStorageSessionId();

        const customerAuthenticationState = this._getPayPalCustomerAuthenticationState();

        return !customerAuthenticationState && paypalConnectSessionId === cart.id;
    }

    // TODO: reimplement this method when PAYPAL-3996.paypal_fastlane_shipping_update and Fastlane features will be rolled out to 100%
    private _shouldUsePayPalFastlaneShippingComponent(): boolean {
        const state = this._store.getState();
        const features = state.config.getStoreConfigOrThrow().checkoutSettings.features;
        const customerAuthenticationState = this._getPayPalCustomerAuthenticationState();

        return (
            features &&
            features['PAYPAL-3996.paypal_fastlane_shipping_update'] &&
            !!customerAuthenticationState &&
            customerAuthenticationState !== PayPalFastlaneAuthenticationState.CANCELED
        );
    }

    private async _initializePayPalSdk(
        methodId: string,
        styles?: PayPalFastlaneStylesOption,
    ): Promise<void> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();

        const paymentMethod = await this._getPayPalPaymentMethodOrThrow(methodId);
        const isTestModeEnabled = !!paymentMethod?.initializationData?.isDeveloperModeApplicable;

        const fastlaneStyles = getFastlaneStyles(
            paymentMethod?.initializationData?.fastlaneStyles,
            styles,
        );

        const paypalFastlaneSdk = await this._paypalCommerceSdk.getPayPalFastlaneSdk(
            paymentMethod,
            cart.currency.code,
            cart.id,
        );

        await this._paypalCommerceFastlaneUtils.initializePayPalFastlane(
            paypalFastlaneSdk,
            isTestModeEnabled,
            fastlaneStyles,
        );
    }

    private async _authenticateUserWithFastlaneOtp(methodId: string): Promise<void> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const customerEmail = state.customer.getCustomer()?.email;
        const billingAddressEmail = state.billingAddress.getBillingAddress()?.email;
        const email = customerEmail || billingAddressEmail || '';

        const { customerContextId } = await this._paypalCommerceFastlaneUtils.lookupCustomerOrThrow(
            email,
        );

        const authenticationResult =
            await this._paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow(
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
            authenticationResult.authenticationState === PayPalFastlaneAuthenticationState.CANCELED;

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
    }

    /**
     *
     * PayPal Fastlane shipping address change through Fastlane external popup
     *
     */
    private async _handlePayPalShippingAddressChange(): Promise<CustomerAddress | undefined> {
        const paypalFastlaneSdk = this._paypalCommerceFastlaneUtils.getPayPalFastlaneOrThrow();

        const { selectionChanged, selectedAddress } =
            await paypalFastlaneSdk.profile.showShippingAddressSelector();

        if (selectionChanged) {
            const state = this._store.getState();
            const shipping = state.shippingAddress.getShippingAddressesOrThrow();
            const paymentProviderCustomer =
                state.paymentProviderCustomer.getPaymentProviderCustomer();
            const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
                ? paymentProviderCustomer
                : {};

            const shippingAddress = this._paypalCommerceFastlaneUtils.mapPayPalToBcAddress(
                selectedAddress.address,
                selectedAddress.name,
                selectedAddress.phoneNumber,
                shipping[0].customFields,
            );

            const paymentProviderCustomerAddresses =
                this._paypalCommerceFastlaneUtils.filterAddresses([
                    shippingAddress,
                    ...(paypalFastlaneCustomer.addresses || []),
                ]);

            await this._store.dispatch(
                this._paymentProviderCustomerActionCreator.updatePaymentProviderCustomer({
                    ...paypalFastlaneCustomer,
                    addresses: paymentProviderCustomerAddresses,
                }),
            );

            await this._store.dispatch(
                this._consignmentActionCreator.updateAddress(shippingAddress),
            );

            return shippingAddress;
        }

        return undefined;
    }
}
