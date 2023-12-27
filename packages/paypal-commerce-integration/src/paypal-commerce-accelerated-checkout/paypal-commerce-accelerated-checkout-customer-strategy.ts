import { isEqual } from 'lodash';

import {
    AddressRequestBody,
    CardInstrument,
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import {
    PayPalCommerceConnect,
    PayPalCommerceConnectAddress,
    PayPalCommerceConnectAuthenticationResult,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceConnectLegacyProfileAddress,
    PayPalCommerceConnectLookupCustomerByEmailResult,
    PayPalCommerceConnectProfileCard,
    PayPalCommerceConnectProfileName,
    PayPalCommerceConnectStylesOption,
    PayPalCommerceInitializationData,
} from '../paypal-commerce-types';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';

import {
    WithPayPalCommerceAcceleratedCheckoutCustomerInitializeOptions
} from './paypal-commerce-accelerated-checkout-customer-initialize-options';

export default class PayPalCommerceAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    private primaryMethodId: string = 'paypalcommerceacceleratedcheckout';
    private isAcceleratedCheckoutEnabled = false;
    private paypalConnect?: PayPalCommerceConnect;
    private paypalConnectStyles?: PayPalCommerceConnectStylesOption;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private browserStorage: BrowserStorage, // TODO: should be changed to cookies implementation
    ) {}

    async initialize(options: CustomerInitializeOptions & WithPayPalCommerceAcceleratedCheckoutCustomerInitializeOptions): Promise<void> {
        const { methodId, paypalcommerceacceleratedcheckout } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        // Can be moved to a separate method isAcceleratedCheckoutEnabled
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        this.isAcceleratedCheckoutEnabled = !!paymentMethod.initializationData?.isAcceleratedCheckoutEnabled;

        if (this.isAcceleratedCheckoutEnabled) {
            this.paypalConnectStyles = paypalcommerceacceleratedcheckout?.styles;
            this.paypalConnect = await this.initializePayPalConnect(methodId);
        }

        return Promise.resolve();
    }

    async deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);
    }

    async executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<void> {
        const { checkoutPaymentMethodExecuted, continueWithCheckoutCallback, methodId } = options || {};

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const isGuestCustomer = state.getCustomer()?.isGuest;

        if (isGuestCustomer && this.isAcceleratedCheckoutEnabled) {
            const shouldRunAuthenticationFlow = await this.shouldRunAuthenticationFlow();

            // TODO: to be done when paypal events will be available
            if (
                checkoutPaymentMethodExecuted &&
                typeof checkoutPaymentMethodExecuted === 'function'
                // && window.paypal.connect.events
            ) {
                checkoutPaymentMethodExecuted();
            }

            if (shouldRunAuthenticationFlow) {
                await this.runPayPalConnectAuthenticationFlowOrThrow();
            }
        }

        continueWithCheckoutCallback();
    }

    /**
     *
     * Initialises PayPal Connect Sdk
     *
     */
    private async initializePayPalConnect(methodId: string): Promise<PayPalCommerceConnect> {
        // TODO: fix the issue with paypal sdk load conflict
        const paypalSdk = await this.paypalCommerceIntegrationService.loadPayPalSdk(
            methodId,
            undefined,
            true,
            true,
        );

        window.localStorage.setItem('axoEnv', 'sandbox');

        return paypalSdk.Connect();
    }

    private getPayPalConnectOrThrow(): PayPalCommerceConnect {
        if (!this.paypalConnect) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalConnect;
    }

    /**
     *
     * Authentication flow methods
     *
     */
    // TODO: remove when A/B testing will be finished
    private async shouldRunAuthenticationFlow(): Promise<boolean> {
        try {
            await this.paymentIntegrationService.loadPaymentMethod(this.primaryMethodId);

            const state = this.paymentIntegrationService.getState();
            const paymentMethod =
                state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(this.primaryMethodId);

            return paymentMethod.initializationData?.shouldRunAcceleratedCheckout || false;
        } catch (_) {
            return false;
        }
    }

    private async runPayPalConnectAuthenticationFlowOrThrow(): Promise<void> {
        try {
            const { customerContextId } = await this.lookupCustomerOrThrow();
            const authenticationResult = await this.triggerAuthenticationFlowOrThrow(
                customerContextId,
            );

            await this.updateCustomerDataStateOrThrow(authenticationResult);
            this.updateStorageSessionId(authenticationResult.authenticationState === PayPalCommerceConnectAuthenticationState.CANCELED);
        } catch (error) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
        }
    }

    private async lookupCustomerOrThrow(): Promise<PayPalCommerceConnectLookupCustomerByEmailResult> {
        const paypalConnect = this.getPayPalConnectOrThrow();

        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomer();
        const billingAddress = state.getBillingAddress();
        const customerEmail = customer?.email || billingAddress?.email || '';

        return paypalConnect.identity.lookupCustomerByEmail(customerEmail);
    }

    private async triggerAuthenticationFlowOrThrow(customerContextId?: string): Promise<PayPalCommerceConnectAuthenticationResult> {
        if (!customerContextId) {
            return {};
        }

        const paypalConnect = this.getPayPalConnectOrThrow();

        return paypalConnect.identity.triggerAuthenticationFlow(
            customerContextId,
            { styles: this.paypalConnectStyles },
        );
    }

    private async updateCustomerDataStateOrThrow(
        authenticationResult?: PayPalCommerceConnectAuthenticationResult
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();

        const { authenticationState, profileData } = authenticationResult || {};

        console.log({ authenticationState, profileData });

        const paypalBillingAddress = profileData?.card?.paymentSource?.card?.billingAddress;
        const paypalShippingAddress = profileData?.shippingAddress;
        const paypalProfileName = profileData?.name;
        const paypalInstrument = profileData?.card;

        const shippingAddress = paypalShippingAddress
            ? this.mapPayPalShippingToBcAddress(paypalShippingAddress.address, paypalShippingAddress.name)
            : undefined;
        const billingAddress = paypalBillingAddress && paypalProfileName
            ? this.mapPayPalBillingToBcAddress(paypalBillingAddress, paypalProfileName)
            : undefined;
        const instruments = paypalInstrument
            ? this.mapPayPalToBcInstrument(paypalInstrument)
            : [];

        const addresses = this.mergeShippingAndBillingAddresses(shippingAddress, billingAddress);

        await this.paymentIntegrationService.updatePaymentProviderCustomer({
            authenticationState: authenticationState || PayPalCommerceConnectAuthenticationState.UNRECOGNIZED,
            addresses: addresses,
            instruments: instruments,
        });

        if (billingAddress) {
            await this.paymentIntegrationService.updateBillingAddress(billingAddress);
        }

        // Info: if not a digital item
        if (shippingAddress && cart.lineItems.physicalItems.length > 0) {
            await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
        }
    }

    private updateStorageSessionId(isAuthenticationFlowCanceled: boolean): void {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();

        // Info:
        // If user unrecognised then the lookup method will be working but the OTP will not be shown
        // If user recognised and not canceled then the lookup method will be working and the OTP will be shown only if needed
        // If user cancels the OPT then OTP will not be triggered after page refresh
        if (isAuthenticationFlowCanceled) {
            // TODO: Should be rewritten to cookies implementation
            this.browserStorage.removeItem('sessionId');
        } else {
            // TODO: Should be rewritten to cookies implementation
            this.browserStorage.setItem('sessionId', cart.id);
        }
    }

    /**
     *
     * PayPal to BC data mappers
     *
     * */
    private mapPayPalShippingToBcAddress(
        address: PayPalCommerceConnectAddress,
        profileName: PayPalCommerceConnectProfileName,
    ): AddressRequestBody {
        const [firstName, lastName] = profileName.fullName.split(' ');

        return {
            firstName: profileName.firstName || firstName || '',
            lastName: profileName.lastName || lastName || '',
            company: address.company || '',
            address1: address.addressLine1,
            address2: address.addressLine2 || '',
            city: address.adminArea2,
            stateOrProvince: address.adminArea1,
            stateOrProvinceCode: address.adminArea1,
            countryCode: address.countryCode || '',
            postalCode: address.postalCode,
            // phone: address.phone, // TODO: update phone number
            phone: '333333333333',
            customFields: [],
        };
    }

    // TODO: remove with PayPal new release
    private mapPayPalBillingToBcAddress(
        address: PayPalCommerceConnectLegacyProfileAddress,
        profileName: PayPalCommerceConnectProfileName,
    ): AddressRequestBody {
        const [firstName, lastName] = profileName.fullName.split(' ');

        return {
            firstName: profileName.firstName || firstName || '',
            lastName: profileName.lastName || lastName || '',
            company: address.company || '',
            address1: address.streetAddress,
            address2: address.extendedAddress || '',
            city: address.locality,
            stateOrProvince: address.region,
            stateOrProvinceCode: address.region,
            countryCode: address.countryCodeAlpha2 || '',
            postalCode: address.postalCode,
            phone: '333333333333', // TODO: update phone number
            customFields: [],
        };
    }

    private mapPayPalToBcInstrument(
        instrument: PayPalCommerceConnectProfileCard,
    ): CardInstrument[] {
        const { id, paymentSource } = instrument;
        const { brand, expiry, lastDigits } = paymentSource.card;

        const [expiryYear, expiryMonth] = expiry.split('-');

        return [
            {
                bigpayToken: id,
                brand,
                defaultInstrument: false,
                expiryMonth,
                expiryYear,
                iin: '',
                last4: lastDigits,
                method: this.primaryMethodId,
                provider: this.primaryMethodId,
                trustedShippingAddress: false,
                type: 'card',
            },
        ];
    }

    private mergeShippingAndBillingAddresses(
        shippingAddress?: AddressRequestBody,
        billingAddress?: AddressRequestBody,
    ): AddressRequestBody[] {
        const isBillingEqualsShipping = isEqual(
            shippingAddress,
            billingAddress,
        );

        return [
            ...(shippingAddress ? [shippingAddress] : []),
            ...(billingAddress && !isBillingEqualsShipping ? [billingAddress] : []),
        ];
    }
}
