import {
    BraintreeAcceleratedCheckoutCustomer,
    CardInstrument,
    CustomerAddress,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import {
    BraintreeConnect,
    BraintreeConnectAddress,
    BraintreeConnectVaultedInstrument,
    BraintreeInitializationData,
} from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';

export default class BraintreeAcceleratedCheckoutUtils {
    private braintreeConnect?: BraintreeConnect;
    private methodId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private browserStorage: BrowserStorage,
    ) {}

    async getDeviceSessionId(): Promise<string | undefined> {
        return this.braintreeIntegrationService.getSessionId();
    }

    getBraintreeConnectOrThrow(): BraintreeConnect {
        if (!this.braintreeConnect) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeConnect;
    }

    /**
     *
     * Initialization method
     *
     * */
    async initializeBraintreeConnectOrThrow(methodId: string) {
        const state = this.paymentIntegrationService.getState();
        const { clientToken, initializationData } =
            state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.methodId = methodId;

        this.braintreeIntegrationService.initialize(clientToken, initializationData);
        this.braintreeConnect = await this.braintreeIntegrationService.getBraintreeConnect();
    }

    /**
     *
     * Authentication methods
     *
     * */
    async authenticatePayPalConnectUserOrThrow(email?: string): Promise<void> {
        try {
            await this.authenticatePayPalConnectUser(email);
        } catch (error) {
            // TODO: we should figure out what to do here
            // TODO: because we should not to stop the flow if the error occurs on paypal side
        }
    }

    private async authenticatePayPalConnectUser(email?: string): Promise<void> {
        const methodId = this.getMethodIdOrThrow();

        const customerEmail = email || this.getEmail();

        if (!this.braintreeConnect || !customerEmail) {
            return;
        }

        const { lookupCustomerByEmail, triggerAuthenticationFlow } = this.braintreeConnect.identity;
        const { customerId } = await lookupCustomerByEmail(customerEmail);

        if (!customerId) {
            return;
        }

        const { authenticationState, profileData } = await triggerAuthenticationFlow(customerId);

        await this.updateCustomerData(customerEmail, {
            authenticationState,
            addresses: this.mapPayPalToBcAddress(profileData.addresses),
            instruments: this.mapPayPalToBcInstrument(methodId, profileData.cards),
        });
    }

    private async updateCustomerData(
        email: string,
        customer: BraintreeAcceleratedCheckoutCustomer,
    ): Promise<void> {
        await this.paymentIntegrationService.updatePaymentProviderCustomer(customer);

        this.browserStorage.setItem('customer', {
            email,
            ...customer,
        });
    }

    private getEmail(): string {
        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomer();
        const billingAddress = state.getBillingAddress();

        return customer?.email || billingAddress?.email || '';
    }

    /**
     *
     * PayPal to BC data mappers
     *
     * */
    private mapPayPalToBcAddress(
        addresses?: BraintreeConnectAddress[],
    ): CustomerAddress[] | undefined {
        if (!addresses) {
            return;
        }

        const countries = this.paymentIntegrationService.getState().getCountries() || [];

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
            phone: '',
            customFields: [],
        }));
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
