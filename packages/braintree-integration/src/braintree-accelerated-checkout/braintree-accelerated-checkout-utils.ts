import { isEqual, omit } from 'lodash';

import {
    BraintreeConnect,
    BraintreeConnectAddress,
    BraintreeConnectAuthenticationState,
    BraintreeConnectPhone,
    BraintreeConnectProfileData,
    BraintreeConnectStylesOption,
    BraintreeConnectVaultedInstrument,
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
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

export default class BraintreeAcceleratedCheckoutUtils {
    private braintreeConnect?: BraintreeConnect;
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
    async initializeBraintreeConnectOrThrow(
        methodId: string,
        styles?: BraintreeConnectStylesOption,
    ) {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCart();
        const storeConfig = state.getStoreConfigOrThrow();
        const { clientToken, config, initializationData } =
            state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.methodId = methodId;

        this.braintreeIntegrationService.initialize(clientToken, storeConfig);
        this.braintreeConnect = await this.braintreeIntegrationService.getBraintreeConnect(
            cart?.id,
            config.testMode,
            styles,
        );
    }

    /**
     *
     * Braintree Connect methods
     *
     */
    getBraintreeConnectOrThrow(): BraintreeConnect {
        if (!this.braintreeConnect) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeConnect;
    }

    getBraintreeConnectComponentOrThrow(): BraintreeConnect['ConnectCardComponent'] {
        const braintreeConnect = this.getBraintreeConnectOrThrow();

        return braintreeConnect.ConnectCardComponent;
    }

    /**
     *
     * Authentication methods
     *
     * */
    async runPayPalConnectAuthenticationFlowOrThrow(email?: string): Promise<void> {
        try {
            const methodId = this.getMethodIdOrThrow();

            const braintreeConnect = this.getBraintreeConnectOrThrow();
            const { lookupCustomerByEmail, triggerAuthenticationFlow } = braintreeConnect.identity;

            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const customer = state.getCustomer();
            const billingAddress = state.getBillingAddress();

            const customerEmail = email || customer?.email || billingAddress?.email || '';

            const { customerContextId } = await lookupCustomerByEmail(customerEmail);

            if (!customerContextId) {
                this.browserStorage.removeItem('sessionId');

                // Info: we should clean up previous experience with default data and related authenticationState
                await this.paymentIntegrationService.updatePaymentProviderCustomer({
                    authenticationState: BraintreeConnectAuthenticationState.UNRECOGNIZED,
                    addresses: [],
                    instruments: [],
                });

                return;
            }

            const { authenticationState, profileData } = await triggerAuthenticationFlow(
                customerContextId,
            );

            const shippingAddresses =
                this.mapPayPalToBcAddress(profileData.addresses, profileData.phones) || [];
            const paypalBillingAddresses = this.getPayPalBillingAddresses(profileData);
            const billingAddresses =
                this.mapPayPalToBcAddress(paypalBillingAddresses, profileData.phones) || [];
            const instruments = this.mapPayPalToBcInstrument(methodId, profileData.cards) || [];
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

            if (billingAddresses.length > 0) {
                await this.paymentIntegrationService.updateBillingAddress(billingAddresses[0]);
            }

            if (shippingAddresses.length > 0 && cart.lineItems.physicalItems.length > 0) {
                await this.paymentIntegrationService.updateShippingAddress(shippingAddresses[0]);
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
    private mapPayPalToBcAddress(
        addresses?: BraintreeConnectAddress[],
        phones?: BraintreeConnectPhone[],
    ): CustomerAddress[] | undefined {
        if (!addresses) {
            return;
        }

        const countries = this.paymentIntegrationService.getState().getCountries() || [];
        const phoneNumber =
            phones && phones[0] ? phones[0].country_code + phones[0].national_number : '';

        const getCountryNameByCountryCode = (countryCode: string) => {
            const matchedCountry = countries.find((country) => country.code === countryCode);

            return matchedCountry?.name || '';
        };

        return addresses.map((address) => ({
            id: Number(address.id),
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
            phone: phoneNumber,
            customFields: [],
        }));
    }

    /**
     *
     * Get PayPal billing addresses from stored braintree instruments info
     *
     * */
    private getPayPalBillingAddresses(
        profileData?: BraintreeConnectProfileData,
    ): BraintreeConnectAddress[] | undefined {
        const { cards, name } = profileData || {};

        if (!cards?.length) {
            return;
        }

        return cards.reduce(
            (
                billingAddressesList: BraintreeConnectAddress[],
                instrument: BraintreeConnectVaultedInstrument,
            ) => {
                const { firstName, lastName } = instrument.paymentSource.card.billingAddress;
                const { given_name, surname } = name || {};
                const address = {
                    ...instrument.paymentSource.card.billingAddress,
                    firstName: firstName || given_name,
                    lastName: lastName || surname,
                };
                const isAddressExist = billingAddressesList.some(
                    (existingAddress: BraintreeConnectAddress) =>
                        isEqual(
                            this.normalizeAddress(address),
                            this.normalizeAddress(existingAddress),
                        ),
                );

                return isAddressExist ? billingAddressesList : [...billingAddressesList, address];
            },
            [],
        );
    }

    private mapPayPalToBcInstrument(
        methodId: string,
        instruments?: BraintreeConnectVaultedInstrument[],
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
            };
        });
    }

    private normalizeAddress(address: CustomerAddress | BraintreeConnectAddress) {
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
}
