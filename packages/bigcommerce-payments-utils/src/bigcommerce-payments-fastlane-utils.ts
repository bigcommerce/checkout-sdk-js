import { isEqual, omit } from 'lodash';

import {
    Address,
    CardInstrument,
    CustomerAddress,
    PaymentMethodClientUnavailableError,
    UntrustedShippingCardVerificationType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import {
    BigCommercePaymentsHostWindow,
    PayPalFastlane,
    PayPalFastlaneAddress,
    PayPalFastlaneAuthenticationResult,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneLookupCustomerByEmailResult,
    PayPalFastlaneProfileCard,
    PayPalFastlaneProfileName,
    PayPalFastlaneProfilePhone,
    PayPalFastlaneProfileToBcCustomerDataMappingResult,
    PayPalFastlaneSdk,
    PayPalFastlaneStylesOption,
} from './bigcommerce-payments-types';

export default class BigCommercePaymentsFastlaneUtils {
    private window: BigCommercePaymentsHostWindow;

    constructor(private browserStorage: BrowserStorage) {
        this.window = window;
    }

    async initializePayPalFastlane(
        paypalFastlaneSdk: PayPalFastlaneSdk,
        isTestModeEnabled: boolean,
        styles?: PayPalFastlaneStylesOption,
    ): Promise<PayPalFastlane> {
        if (isTestModeEnabled) {
            window.localStorage.setItem('fastlaneEnv', 'sandbox');
            window.localStorage.setItem('axoEnv', 'sandbox'); // TODO: remove if this key does not use on PayPal side
        }

        if (!this.window.paypalFastlane) {
            const defaultStyles = {
                root: {
                    backgroundColorPrimary: 'transparent',
                },
            };

            this.window.paypalFastlane = await paypalFastlaneSdk.Fastlane({
                styles: styles || defaultStyles,
            });
        }

        return this.window.paypalFastlane;
    }

    getPayPalFastlaneOrThrow(): PayPalFastlane {
        if (!this.window.paypalFastlane) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.paypalFastlane;
    }

    /**
     *
     * Detects the customer to PayPal Fastlane relation and
     * returns customerContextId to use it for authentication
     *
     */
    async lookupCustomerOrThrow(email: string): Promise<PayPalFastlaneLookupCustomerByEmailResult> {
        const paypalFastlane = this.getPayPalFastlaneOrThrow();

        return paypalFastlane.identity.lookupCustomerByEmail(email);
    }

    /**
     *
     * Triggers authentication flow (shows OTP popup) if the customer recognised as PayPal Fastlane user
     * and returns PayPal Fastlane Profile data to use it in BC checkout
     *
     */
    async triggerAuthenticationFlowOrThrow(
        customerContextId?: string,
    ): Promise<PayPalFastlaneAuthenticationResult> {
        if (!customerContextId) {
            return {};
        }

        const paypalFastlane = this.getPayPalFastlaneOrThrow();

        return paypalFastlane.identity.triggerAuthenticationFlow(customerContextId);
    }

    /**
     *
     * 'updateStorageSessionId' method is used to:
     * - set session id after user was authenticated (or unrecognised) to trigger authentication after page refresh
     * - remove sessionId from browser storage if the customer canceled PayPal Fastlane Authentication
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
     * 'mapPayPalFastlaneProfileToBcCustomerData' method is responsible for:
     * - mapping PayPal Fastlane Profile data to BC data shape
     * - returning mapped data to use for updating PaymentProviderCustomer state and
     * update shipping and billing addresses
     *
     */
    mapPayPalFastlaneProfileToBcCustomerData(
        methodId: string,
        authenticationResult: PayPalFastlaneAuthenticationResult,
    ): PayPalFastlaneProfileToBcCustomerDataMappingResult {
        const { authenticationState, profileData } = authenticationResult;

        const paypalBillingAddress = profileData?.card?.paymentSource?.card?.billingAddress;
        const paypalShippingAddress = profileData?.shippingAddress;
        const paypalProfileName = profileData?.name;
        const paypalInstrument = profileData?.card;

        const shippingAddress = paypalShippingAddress
            ? this.mapPayPalToBcAddress(
                  paypalShippingAddress.address,
                  paypalShippingAddress.name,
                  paypalShippingAddress.phoneNumber,
              )
            : undefined;
        const billingAddress =
            paypalBillingAddress && paypalProfileName
                ? this.mapPayPalToBcAddress(
                      paypalBillingAddress,
                      paypalProfileName,
                      paypalShippingAddress?.phoneNumber,
                  )
                : undefined;
        const instruments = paypalInstrument
            ? this.mapPayPalToBcInstrument(methodId, paypalInstrument)
            : [];

        const addresses = this.filterAddresses([shippingAddress, billingAddress]);

        return {
            authenticationState:
                authenticationState || PayPalFastlaneAuthenticationState.UNRECOGNIZED,
            addresses,
            billingAddress,
            shippingAddress,
            instruments,
        };
    }

    mapPayPalToBcInstrument(
        methodId: string,
        instrument: PayPalFastlaneProfileCard,
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
                untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
                type: 'card',
            },
        ];
    }

    mapBcToPayPalAddress(address?: Address): PayPalFastlaneAddress {
        return {
            company: address?.company || '',
            addressLine1: address?.address1 || '',
            addressLine2: address?.address2 || '',
            adminArea1: address?.stateOrProvinceCode || address?.stateOrProvince || '',
            adminArea2: address?.city || '',
            postalCode: address?.postalCode || '',
            countryCode: address?.countryCode || '',
        };
    }

    mapPayPalToBcAddress(
        address: PayPalFastlaneAddress,
        profileName: PayPalFastlaneProfileName,
        phone?: PayPalFastlaneProfilePhone,
        customFields?: CustomerAddress['customFields'],
    ): CustomerAddress {
        const [firstName, lastName] = profileName.fullName.split(' ');

        const phoneData = {
            nationalNumber: phone?.nationalNumber || '',
            countryCode: phone?.countryCode || '',
        };

        return {
            id: Date.now(),
            type: 'paypal-address',
            firstName: profileName.firstName || firstName || '',
            lastName: profileName.lastName || lastName || '',
            company: address.company || '',
            address1: address.addressLine1,
            address2: address.addressLine2 || '',
            city: address.adminArea2,
            stateOrProvince: address.adminArea1,
            stateOrProvinceCode: address.adminArea1,
            country: address.countryCode || '', // TODO: update country with valid naming
            countryCode: address.countryCode || '',
            postalCode: address.postalCode,
            phone: phoneData.countryCode + phoneData.nationalNumber,
            customFields: customFields || [],
        };
    }

    /**
     *
     * This method is responsible for filtering PayPal Fastlane addresses if they are the same
     * and returns an array of addresses to use them for shipping and/or billing address selections
     * so the customer will be able to use addresses from PayPal Fastlane in checkout flow
     *
     */
    filterAddresses(addresses: Array<CustomerAddress | undefined>): CustomerAddress[] {
        return addresses.reduce(
            (customerAddresses: CustomerAddress[], currentAddress: CustomerAddress | undefined) => {
                if (!currentAddress) {
                    return customerAddresses;
                }

                const sameAddressInTheArray = customerAddresses.some((customerAddress) =>
                    this.isEqualAddresses(customerAddress, currentAddress),
                );

                return sameAddressInTheArray
                    ? customerAddresses
                    : [...customerAddresses, currentAddress];
            },
            [],
        );
    }

    private isEqualAddresses(
        firstAddress: CustomerAddress,
        secondAddress: CustomerAddress,
    ): boolean {
        return isEqual(this.normalizeAddress(firstAddress), this.normalizeAddress(secondAddress));
    }

    private normalizeAddress(address: CustomerAddress) {
        return omit(address, ['id', 'phone']);
    }
}
