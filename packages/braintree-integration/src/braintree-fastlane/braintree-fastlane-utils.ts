import { isEqual, omit } from 'lodash';

import {
    BraintreeFastlane,
    BraintreeFastlaneAddress,
    BraintreeFastlaneAuthenticationState,
    BraintreeFastlaneProfileData,
    BraintreeFastlaneStylesOption,
    BraintreeFastlaneVaultedInstrument,
    BraintreeInitializationData,
    BraintreeIntegrationService,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CardInstrument,
    CustomerAddress,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    UntrustedShippingCardVerificationType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

export default class BraintreeFastlaneUtils {
    private braintreeFastlane?: BraintreeFastlane;
    private methodId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private browserStorage: BrowserStorage,
    ) {}

    async getDeviceSessionId(): Promise<string | undefined> {
        const cart = this.paymentIntegrationService.getState().getCart();

        return this.braintreeIntegrationService.getSessionId(cart?.id);
    }

    /**
     *
     * Initialization method
     *
     */
    async initializeBraintreeFastlaneOrThrow(
        methodId: string,
        styles?: BraintreeFastlaneStylesOption,
    ) {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCart();
        const storeConfig = state.getStoreConfigOrThrow();
        const { clientToken, config } =
            state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.methodId = methodId;

        this.braintreeIntegrationService.initialize(clientToken, storeConfig);

        this.braintreeFastlane = await this.braintreeIntegrationService.getBraintreeFastlane(
            cart?.id,
            config.testMode,
            styles,
        );
    }

    getBraintreeFastlaneOrThrow(): BraintreeFastlane {
        if (!this.braintreeFastlane) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeFastlane;
    }

    getBraintreeFastlaneComponentOrThrow(): BraintreeFastlane['FastlaneCardComponent'] {
        const braintreeFastlane = this.getBraintreeFastlaneOrThrow();

        return braintreeFastlane.FastlaneCardComponent;
    }

    /**
     *
     * Authentication methods
     *
     * */
    async runPayPalAuthenticationFlowOrThrow(
        email?: string,
        shouldSetShippingOption?: boolean,
    ): Promise<void> {
        try {
            const methodId = this.getMethodIdOrThrow();
            const braintreeFastlane = this.getBraintreeFastlaneOrThrow();
            const { lookupCustomerByEmail, triggerAuthenticationFlow } = braintreeFastlane.identity;

            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const customer = state.getCustomer();
            const billingAddress = state.getBillingAddress();

            const customerEmail = email || customer?.email || billingAddress?.email || '';

            const { customerContextId } = await lookupCustomerByEmail(customerEmail);

            if (!customerContextId) {
                // Info: we should clean up previous experience with default data and related authenticationState
                await this.paymentIntegrationService.updatePaymentProviderCustomer({
                    authenticationState: BraintreeFastlaneAuthenticationState.UNRECOGNIZED,
                    addresses: [],
                    instruments: [],
                });

                this.browserStorage.setItem('sessionId', cart.id);

                return;
            }

            const { authenticationState, profileData } = await triggerAuthenticationFlow(
                customerContextId,
            );

            const phoneNumber = profileData?.shippingAddress?.phoneNumber || '';

            if (authenticationState === BraintreeFastlaneAuthenticationState.CANCELED) {
                await this.paymentIntegrationService.updatePaymentProviderCustomer({
                    authenticationState,
                    addresses: [],
                    instruments: [],
                });

                this.browserStorage.removeItem('sessionId');

                return;
            }

            const shippingAddresses =
                this.mapPayPalToBcAddress([profileData.shippingAddress], [phoneNumber]) || [];
            const paypalBillingAddress = this.getPayPalBillingAddresses(profileData);
            const billingAddresses = paypalBillingAddress
                ? this.mapPayPalToBcAddress([paypalBillingAddress], [phoneNumber])
                : [];
            const instruments = profileData.card
                ? this.mapPayPalToBcInstrument(methodId, [profileData.card])
                : [];
            const addresses = this.mergeShippingAndBillingAddresses(
                shippingAddresses,
                billingAddresses,
            );

            this.browserStorage.setItem('sessionId', cart.id);
            await this.paymentIntegrationService.updatePaymentProviderCustomer({
                authenticationState,
                addresses,
                instruments,
            });

            if (billingAddresses.length > 0 && cart.lineItems.physicalItems.length > 0) {
                await this.paymentIntegrationService.updateBillingAddress(billingAddresses[0]);
            }

            // Prefill billing form if only digital items in cart with billing data and firstName and lastName
            // from shippingAddresses because there are empty in billing
            if (
                billingAddresses.length > 0 &&
                cart.lineItems.digitalItems.length > 0 &&
                cart.lineItems.physicalItems.length === 0
            ) {
                const { firstName, lastName } = addresses[0];
                const digitalItemBilling = {
                    ...billingAddresses[0],
                    firstName,
                    lastName,
                };

                await this.paymentIntegrationService.updateBillingAddress(digitalItemBilling);
            }

            if (shippingAddresses.length > 0 && cart.lineItems.physicalItems.length > 0) {
                await this.paymentIntegrationService.updateShippingAddress(shippingAddresses[0]);

                if (shouldSetShippingOption) {
                    await this.setShippingOption();
                }
            }
        } catch (error) {
            // TODO: we should figure out what to do here
            // TODO: because we should not to stop the flow if the error occurs on paypal side
        }
    }

    /**
     *
     * PayPal to BC data mappers
     *
     * */
    mapPayPalToBcInstrument(
        methodId: string,
        instruments?: BraintreeFastlaneVaultedInstrument[],
    ): CardInstrument[] | undefined {
        if (!instruments) {
            return;
        }

        return instruments.map((instrument) => {
            const { id, paymentSource } = instrument;
            const { brand, expiry, lastDigits } = paymentSource.card;

            const [expiryYear, expiryMonth] = expiry.split('-');

            return {
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
                untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
            };
        });
    }

    private mapPayPalToBcAddress(
        addresses?: BraintreeFastlaneAddress[],
        phones?: string[],
    ): CustomerAddress[] {
        if (!addresses) {
            return [];
        }

        const countries = this.paymentIntegrationService.getState().getCountries() || [];

        const getCountryNameByCountryCode = (countryCode: string) => {
            const matchedCountry = countries.find((country) => country.code === countryCode);

            return matchedCountry?.name || '';
        };

        return addresses.map((address) => ({
            id: Date.now(),
            type: 'paypal-address',
            firstName: address.firstName || '',
            lastName: address.lastName || '',
            company: address.company || '',
            address1: address.streetAddress,
            address2: address.extendedAddress || '',
            city: address.locality,
            stateOrProvince: address.region,
            stateOrProvinceCode: address.region,
            country: getCountryNameByCountryCode(address.countryCodeAlpha2),
            countryCode: address.countryCodeAlpha2,
            postalCode: address.postalCode,
            phone: (phones && phones[0]) || '',
            customFields: [],
        }));
    }

    /**
     *
     * Get PayPal billing addresses from stored braintree instruments info
     *
     * */
    private getPayPalBillingAddresses(
        profileData?: BraintreeFastlaneProfileData,
    ): BraintreeFastlaneAddress | undefined {
        const { card, name } = profileData || {};

        if (!card) {
            return;
        }

        const { firstName, lastName } = card.paymentSource.card.billingAddress;
        const { firstName: given_name, lastName: surname } = name || {};
        const { shippingAddress } = profileData || {};
        const address = {
            ...card.paymentSource.card.billingAddress,
            firstName: firstName || given_name,
            lastName: lastName || surname,
        };

        const isAddressExist =
            shippingAddress &&
            isEqual(this.normalizeAddress(address), this.normalizeAddress(shippingAddress));

        return isAddressExist ? shippingAddress : address;
    }

    private normalizeAddress(address: CustomerAddress | BraintreeFastlaneAddress) {
        return omit(address, ['id']);
    }

    private mergeShippingAndBillingAddresses(
        shippingAddresses: CustomerAddress[],
        billingAddresses: CustomerAddress[],
    ): CustomerAddress[] {
        const filteredBillingAddresses = billingAddresses.filter(
            (billingAddress: CustomerAddress) =>
                !shippingAddresses.some((shippingAddress: CustomerAddress) => {
                    return isEqual(
                        this.normalizeAddress(shippingAddress),
                        this.normalizeAddress(billingAddress),
                    );
                }),
        );

        return [...shippingAddresses, ...filteredBillingAddresses];
    }

    /**
     *
     * Other
     *
     * */
    private getMethodIdOrThrow(): string {
        if (!this.methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        return this.methodId;
    }

    private async setShippingOption(): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const consignments = state.getConsignments() || [];
        const availableShippingOptions = consignments[0]?.availableShippingOptions || [];
        const recommendedShippingOption = availableShippingOptions.find(
            (option) => option.isRecommended,
        );

        if (recommendedShippingOption || availableShippingOptions.length) {
            const selectedOption = recommendedShippingOption || availableShippingOptions[0];

            await this.paymentIntegrationService.selectShippingOption(selectedOption.id);
        }
    }
}
