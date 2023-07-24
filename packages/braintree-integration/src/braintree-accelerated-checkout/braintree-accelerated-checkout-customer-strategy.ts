import {
    AddressRequestBody,
    CardInstrument,
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeIntegrationService from '../braintree-integration-service';
import {
    BraintreeConnect,
    BraintreeConnectAddress, BraintreeConnectVaultedInstrument,
    BraintreeInitializationData,
    BraintreeProviderCustomerData,
} from '../braintree';

export default class BraintreeAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    private braintreeConnect?: BraintreeConnect;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<void> {
        const { methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = await this.paymentIntegrationService.getState();
        const { clientToken, initializationData } = state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreeIntegrationService.initialize(clientToken, initializationData);
        this.braintreeConnect = await this.braintreeIntegrationService.getBraintreeConnect();
    }

    async deinitialize(): Promise<void> {
        await this.braintreeIntegrationService.teardown();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);
    }

    async executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        const { methodId, continueWithCheckoutCallback } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        try {
            await this.authenticatePayPalConnectUser(methodId);
        } catch (error) {
            console.log(error);
        }

        continueWithCheckoutCallback();

        return;
    }

    private async authenticatePayPalConnectUser(methodId: string) {
        const email = this.getEmail();

        if (!this.braintreeConnect || !email) {
            return;
        }

        const { lookupCustomerByEmail, triggerAuthenticationFlow } = this.braintreeConnect.identity;
        const { customerId } = await lookupCustomerByEmail(email) || {};

        if (!customerId) {
            return;
        }

        const { authenticationState, profileData } = await triggerAuthenticationFlow(customerId);

        if (authenticationState === 'succeeded') {
            const addresses = profileData.addresses.map(this.mapPayPalConnectToBcAddress);
            const instruments = profileData.cards.map(
                instrument => this.mapPayPalConnectToBcInstrument(instrument, methodId),
            );

            await this.paymentIntegrationService.updateProviderCustomerData<BraintreeProviderCustomerData>({
                authentication: 'succeeded',
                addresses,
                instruments,
            });
        } else {
            await this.paymentIntegrationService.updateProviderCustomerData<BraintreeProviderCustomerData>({
                authentication: 'canceled',
                addresses: [],
                instruments: [],
            });
        }
    }

    private getEmail(): string {
        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomer();
        const billingAddress = state.getBillingAddress();

        return customer?.email || billingAddress?.email || '';
    }

    private mapPayPalConnectToBcAddress(address: BraintreeConnectAddress): AddressRequestBody {
        return {
            firstName: address.firstName || '',
            lastName: address.lastName || '',
            company: address.company || '',
            address1: address.streetAddress,
            address2: address.extendedAddress || '',
            city: address.locality,
            stateOrProvince: address.region,
            stateOrProvinceCode: address.region,
            countryCode: address.countryCodeAlpha2,
            postalCode: address.postalCode,
            phone: '',
            customFields: [],
        };
    }

    private mapPayPalConnectToBcInstrument(
        instrument: BraintreeConnectVaultedInstrument,
        methodId: string,
    ): CardInstrument {
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
    }
}
