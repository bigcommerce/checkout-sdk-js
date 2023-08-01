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

import {
    BraintreeConnect,
    BraintreeConnectAddress,
    BraintreeConnectAuthenticationState,
    BraintreeConnectVaultedInstrument,
    BraintreeInitializationData,
} from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';

export default class BraintreeAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    private braintreeConnect?: BraintreeConnect;
    private methodId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<void> {
        const methodId = this.setMethodIdOrThrow(options.methodId);

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const { clientToken, initializationData } =
            state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

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

        await this.authenticatePayPalConnectUserOrThrow(credentials.email);
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);
    }

    async executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<void> {
        const { continueWithCheckoutCallback } = options || {};

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        await this.authenticatePayPalConnectUserOrThrow();

        continueWithCheckoutCallback();
    }

    private async authenticatePayPalConnectUserOrThrow(email?: string): Promise<void> {
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

        if (authenticationState === BraintreeConnectAuthenticationState.SUCCEEDED) {
            const addresses = profileData.addresses.map(this.mapPayPalConnectToBcAddress);
            const instruments = profileData.cards.map((instrument) =>
                this.mapPayPalConnectToBcInstrument(instrument, methodId),
            );

            await this.paymentIntegrationService.updatePaymentProviderCustomer({
                authenticationState: BraintreeConnectAuthenticationState.SUCCEEDED,
                addresses,
                instruments,
            });
        } else {
            await this.paymentIntegrationService.updatePaymentProviderCustomer({
                authenticationState: BraintreeConnectAuthenticationState.CANCELED,
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

    private getMethodIdOrThrow(): string {
        if (!this.methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        return this.methodId;
    }

    private setMethodIdOrThrow(methodId?: string): string {
        this.methodId = methodId;

        return this.getMethodIdOrThrow();
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
