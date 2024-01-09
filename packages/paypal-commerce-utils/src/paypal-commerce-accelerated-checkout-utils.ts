import { isEqual } from 'lodash';

import {
    Address,
    AddressRequestBody,
    CardInstrument,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import {
    PayPalAxoSdk,
    PayPalCommerceConnect,
    PayPalCommerceConnectAddress,
    PayPalCommerceConnectAuthenticationResult,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceConnectLegacyProfileAddress,
    PayPalCommerceConnectLookupCustomerByEmailResult,
    PayPalCommerceConnectProfileCard,
    PayPalCommerceConnectProfileName,
    PayPalCommerceConnectStylesOption,
} from './paypal-commerce-types';

export default class PayPalCommerceAcceleratedCheckoutUtils {
    private paypalConnect?: PayPalCommerceConnect;

    constructor(
        private browserStorage: BrowserStorage, // TODO: should be changed to cookies implementation
    ) {}

    async initializePayPalConnect(
        paypalAxoSdk: PayPalAxoSdk,
        isTestModeEnabled: boolean,
    ): Promise<PayPalCommerceConnect> {
        if (isTestModeEnabled) {
            window.localStorage.setItem('axoEnv', 'sandbox');
        }

        this.paypalConnect = await paypalAxoSdk.Connect();

        return this.paypalConnect;
    }

    getPayPalConnectOrThrow(): PayPalCommerceConnect {
        if (!this.paypalConnect) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalConnect;
    }

    /**
     *
     * Detects the customer to PayPal Connect relation and
     * returns customerContextId to use it for authentication
     *
     */
    async lookupCustomerOrThrow(
        email: string,
    ): Promise<PayPalCommerceConnectLookupCustomerByEmailResult> {
        const paypalConnect = this.getPayPalConnectOrThrow();

        return paypalConnect.identity.lookupCustomerByEmail(email);
    }

    /**
     *
     * Triggers authentication flow (shows OTP popup) if the customer recognised as PayPal Connect user
     * and returns PayPal Connect Profile data to use it in BC checkout
     *
     */
    async triggerAuthenticationFlowOrThrow(
        customerContextId?: string,
        styles?: PayPalCommerceConnectStylesOption,
    ): Promise<PayPalCommerceConnectAuthenticationResult> {
        if (!customerContextId) {
            return {};
        }

        const paypalConnect = this.getPayPalConnectOrThrow();

        return paypalConnect.identity.triggerAuthenticationFlow(customerContextId, { styles });
    }

    /**
     *
     * 'updateStorageSessionId' method is used to:
     * - set session id after user was authenticated (or unrecognised) to trigger authentication after page refresh
     * - remove sessionId from browser storage if the customer canceled PayPal Connect Authentication
     *
     * Flow info:
     * If user unrecognised then the lookup method will be working but the OTP will not be shown
     * If user recognised and not canceled then the lookup method will be working and the OTP will be shown only if needed
     * If user cancels the OPT then OTP will not be triggered after page refresh
     *
     */
    updateStorageSessionId(shouldBeRemoved: boolean, sessionId?: string): void {
        if (shouldBeRemoved) {
            // TODO: Should be rewritten to cookies implementation
            this.browserStorage.removeItem('sessionId');
        } else {
            // TODO: Should be rewritten to cookies implementation
            this.browserStorage.setItem('sessionId', sessionId);
        }
    }

    getStorageSessionId(): string {
        // TODO: Should be rewritten to cookies implementation
        return this.browserStorage.getItem('sessionId') || '';
    }

    /**
     *
     * 'mapPayPalConnectProfileToBcCustomerData' method is responsible for:
     * - mapping PayPal Connect Profile data to BC data shape
     * - returning mapped data to use for updating PaymentProviderCustomer state and
     * update shipping and billing addresses
     *
     */
    // TODO: add return interface later
    mapPayPalConnectProfileToBcCustomerData(
        methodId: string,
        authenticationResult?: PayPalCommerceConnectAuthenticationResult,
    ) {
        const { authenticationState, profileData } = authenticationResult || {};

        const paypalBillingAddress = profileData?.card?.paymentSource?.card?.billingAddress;
        const paypalShippingAddress = profileData?.shippingAddress;
        const paypalProfileName = profileData?.name;
        const paypalInstrument = profileData?.card;

        const shippingAddress = paypalShippingAddress
            ? this.mapPayPalToBcAddress(paypalShippingAddress.address, paypalShippingAddress.name)
            : undefined;
        const billingAddress =
            paypalBillingAddress && paypalProfileName
                ? this.mapPayPalBillingToBcAddress(paypalBillingAddress, paypalProfileName)
                : undefined;
        const instruments = paypalInstrument
            ? this.mapPayPalToBcInstrument(methodId, paypalInstrument)
            : [];

        const addresses = this.mergeShippingAndBillingAddresses(shippingAddress, billingAddress);

        return {
            authenticationState:
                authenticationState || PayPalCommerceConnectAuthenticationState.UNRECOGNIZED,
            addresses,
            billingAddress,
            shippingAddress,
            instruments,
        };
    }

    mapPayPalToBcInstrument(
        methodId: string,
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
                method: methodId,
                provider: methodId,
                trustedShippingAddress: false,
                type: 'card',
            },
        ];
    }

    mapBcToPayPalAddress(address?: Address): PayPalCommerceConnectAddress {
        return {
            company: address?.company || '',
            addressLine1: address?.address1 || '',
            addressLine2: address?.address2 || '',
            adminArea1: address?.stateOrProvinceCode || '',
            adminArea2: address?.city || '',
            postalCode: address?.postalCode || '',
            countryCode: address?.countryCode || '',
            phone: address?.phone || '',
        };
    }

    private mapPayPalToBcAddress(
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
            // phone: address.phone,
            phone: '333333333333', // TODO: remove phone number mock when its done on PP side
            customFields: [],
        };
    }

    // Info: this method will be deprecated in one of PayPal future release
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
            // phone: address.phone,
            phone: '333333333333', // TODO: remove phone number mock when its done on PP side
            customFields: [],
        };
    }

    /**
     *
     * This method is responsible for filtering PP Connect addresses if they are the same
     * and returns an array of addresses to use them for shipping and/or billing address selections
     * so the customer will be able to use addresses from PP Connect in checkout flow
     *
     */
    private mergeShippingAndBillingAddresses(
        shippingAddress?: AddressRequestBody,
        billingAddress?: AddressRequestBody,
    ): AddressRequestBody[] {
        const isBillingEqualsShipping = isEqual(shippingAddress, billingAddress);

        return [
            ...(shippingAddress ? [shippingAddress] : []),
            ...(billingAddress && !isBillingEqualsShipping ? [billingAddress] : []),
        ];
    }
}
