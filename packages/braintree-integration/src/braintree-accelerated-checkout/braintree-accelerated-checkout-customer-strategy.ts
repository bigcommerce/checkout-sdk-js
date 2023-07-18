import { createAction } from '@bigcommerce/data-store';

import {
    CustomerActionType,
    CustomerAddress,
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
import { BraintreeConnect, BraintreeConnectAddress } from '../braintree';
import {
    WithBraintreeAcceleratedCheckoutCustomerInitializeOptions
} from './braintree-accelerated-checkout-customer-initialize-options';
import { mockedProfileData } from './bt-axo-mocked-data';

// import { mockedProfileData } from './bt-axo-mocked-data';

// TODO list related to customer strategy
// 1. Pass addresses to checkout state to use them in shipping and billing steps; DONE -> needs to be tested
// 2. Create customer suggestion block; // DONE -> needs to be tested
// 3. Test shipping for logged in user; //


// TODO list related to payment strategy
// 1. Should I pass vaulted instruments to checkout state?

export default class BraintreeAcceleratedCheckoutCustomerStrategy implements CustomerStrategy {
    private braintreeConnect?: BraintreeConnect;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBraintreeAcceleratedCheckoutCustomerInitializeOptions
    ): Promise<void> {
        const { methodId, braintreeacceleratedcheckout } = options;
        const { authenticateOnInitialization , onError} = braintreeacceleratedcheckout || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        const state = await this.paymentIntegrationService.loadPaymentMethod(methodId);
        const { isPayPalConnectAuthenticated, isPayPalConnectCanceled } = state.getCustomerOrThrow();
        const { clientToken } = state.getPaymentMethodOrThrow(methodId);

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken);
            this.braintreeConnect = await this.braintreeIntegrationService.getBraintreeConnect();

            if (authenticateOnInitialization && !isPayPalConnectAuthenticated && !isPayPalConnectCanceled) {
                await this.authenticatePayPalConnectUser();
            }
        } catch (error) {
            if (onError && typeof onError === 'function') {
                onError(error);
            } else {
                throw error;
            }
        }
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

        // Do I need try catch here?
        try {
            await this.authenticatePayPalConnectUser();
        } catch (error) {
            throw error;
        }

        continueWithCheckoutCallback();

        return;
    }

    // TODO: think about how to make it more understandable
    // authenticate, get profile data, map and update customer state

    // { profileData } = authenticateUserWithPayPalConnect(email)
    // removeDuplicatedAddresses -> so in this case we should remove bc duplicated addresses that match PP Connect addresses
    // updateCustomerStateWithNewAddresses(addresses)
    private async authenticatePayPalConnectUser() {
        const devMode = true;

        const email = this.getEmail();

        if (!email || !this.braintreeConnect) {
            return;
        }

        const { lookupCustomerByEmail, triggerAuthenticationFlow } = this.braintreeConnect.identity;
        const { customerId } = await lookupCustomerByEmail(email) || {};

        if (!customerId && !devMode) {
            return;
        }

        // TODO: check if paypal triggers OTP each time on method call
        const { authenticationState, profileData } = devMode
            ? { authenticationState: 'succeeded', profileData: mockedProfileData }
            : await triggerAuthenticationFlow(customerId);

        if (authenticationState === 'succeeded') {
            // Don't really sure that we should store anything in local storage
            // localStorage.setItem('ppConnectProfileData', JSON.stringify(profileData));

            const state = this.paymentIntegrationService.getState();
            const customer = state.getCustomerOrThrow();

            // TODO: check and filter similar addresses to avoid duplications
            // PP Connect addresses should be keep due to the priority
            const paypalConnectAddresses = profileData.addresses.map(this.mapPayPalConnectToCustomerAddress);
            const updatedCustomer = {
                ...customer,
                addresses: [...customer.addresses, ...paypalConnectAddresses], // TODO: filter them somehow
                isPayPalConnectAuthenticated: true,
            };

            const updateCustomerWithPayPalConnectDataAction = createAction(CustomerActionType.PayPalConnectAuthenticated, updatedCustomer);

            // TODO: I was finished here last time
            // Should I add another action to set isPayPalConnectAuthenticated as true?
            await this.paymentIntegrationService.dispatch(updateCustomerWithPayPalConnectDataAction);
        } else {
            const payPalConnectAuthenticationCanceledAction = createAction(CustomerActionType.PayPalConnectCanceled, true);
            await this.paymentIntegrationService.dispatch(payPalConnectAuthenticationCanceledAction);
        }
    }

    private getEmail(): string {
        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomer();
        const billingAddress = state.getBillingAddress();

        return customer?.email || billingAddress?.email || '';
    }

    private mapPayPalConnectToCustomerAddress(address: BraintreeConnectAddress): Partial<CustomerAddress> {
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
            poweredBy: 'paypal-connect',
            phone: '',
        };
    }

    // TODO: this is an example of address filtration
    // const uniqueArray = obj.arr.filter((value, index) => {
    //     const _value = JSON.stringify(value);
    //     return index === obj.arr.findIndex(obj => {
    //         return JSON.stringify(obj) === _value;
    //     });
    // });
}


