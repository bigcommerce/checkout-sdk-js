import {
    BigCommercePaymentsFastlaneUtils,
    BigCommercePaymentsInitializationData,
    getFastlaneStyles,
    isBigCommercePaymentsFastlaneCustomer,
    isPayPalFastlaneCustomer,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneStylesOption,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { CustomerAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AddressRequestBody } from '../../../address';
import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { PaymentProviderCustomerActionCreator } from '../../../payment-provider-customer';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ShippingInitializeOptions, ShippingRequestOptions } from '../../shipping-request-options';
import ShippingStrategy from '../shipping-strategy';

export default class BigCommercePaymentsFastlaneShippingStrategy implements ShippingStrategy {
    constructor(
        private _store: CheckoutStore,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator,
        private _paypalSdkHelper: PayPalSdkHelper,
        private _bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils,
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
        const { methodId, bigcommerce_payments_fastlane } = options || {};
        const { onPayPalFastlaneAddressChange, styles } = bigcommerce_payments_fastlane || {};

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
    ): Promise<PaymentMethod<BigCommercePaymentsInitializationData>> {
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
        const bigCommercePaymentsPaymentProviderCustomer = isBigCommercePaymentsFastlaneCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        return bigCommercePaymentsPaymentProviderCustomer.authenticationState;
    }

    private _shouldAuthenticateUserWithFastlane(): boolean {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const paypalConnectSessionId = this._bigCommercePaymentsFastlaneUtils.getStorageSessionId();

        const customerAuthenticationState = this._getPayPalCustomerAuthenticationState();

        return !customerAuthenticationState && paypalConnectSessionId === cart.id;
    }

    private _shouldUsePayPalFastlaneShippingComponent(): boolean {
        const customerAuthenticationState = this._getPayPalCustomerAuthenticationState();

        return (
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
        const { isDeveloperModeApplicable, isFastlaneStylingEnabled } =
            paymentMethod?.initializationData || {};
        const isTestModeEnabled = !!isDeveloperModeApplicable;

        const fastlaneStyles = getFastlaneStyles(
            isFastlaneStylingEnabled ? paymentMethod?.initializationData?.fastlaneStyles : {},
            styles,
        );

        const paypalFastlaneSdk = await this._paypalSdkHelper.getPayPalFastlaneSdk(
            paymentMethod,
            cart.currency.code,
            cart.id,
        );

        await this._bigCommercePaymentsFastlaneUtils.initializePayPalFastlane(
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

        const { customerContextId } =
            await this._bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow(email);

        const authenticationResult =
            await this._bigCommercePaymentsFastlaneUtils.triggerAuthenticationFlowOrThrow(
                customerContextId,
            );

        const { authenticationState, addresses, billingAddress, shippingAddress, instruments } =
            this._bigCommercePaymentsFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData(
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

        if (isAuthenticationFlowCanceled) {
            this._bigCommercePaymentsFastlaneUtils.removeStorageSessionId();
        } else {
            this._bigCommercePaymentsFastlaneUtils.updateStorageSessionId(cart.id);
        }

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
     * BigCommercePayments Fastlane shipping address change through Fastlane external popup
     *
     */
    private async _handlePayPalShippingAddressChange(): Promise<CustomerAddress | undefined> {
        const paypalFastlaneSdk = this._bigCommercePaymentsFastlaneUtils.getPayPalFastlaneOrThrow();

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

            const shippingAddress = this._bigCommercePaymentsFastlaneUtils.mapPayPalToBcAddress(
                selectedAddress.address,
                selectedAddress.name,
                selectedAddress.phoneNumber,
                shipping[0]?.customFields,
            );

            const paymentProviderCustomerAddresses =
                this._bigCommercePaymentsFastlaneUtils.filterAddresses([
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
