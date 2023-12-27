import { isEqual } from 'lodash';

import {
    Address,
    AddressRequestBody,
    CardInstrument,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody, Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    PaymentRequestOptions,
    PaymentStrategy,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    PayPalCommerceConnect,
    PayPalCommerceConnectAddress,
    PayPalCommerceConnectAuthenticationResult,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceConnectCardComponent,
    PayPalCommerceConnectCardComponentOptions,
    PayPalCommerceConnectLegacyProfileAddress,
    PayPalCommerceConnectLookupCustomerByEmailResult,
    PayPalCommerceConnectProfileCard,
    PayPalCommerceConnectProfileName,
    PayPalCommerceConnectStylesOption,
} from '../paypal-commerce-types';

import {
    WithPayPalCommerceAcceleratedCheckoutPaymentInitializeOptions
} from './paypal-commerce-accelerated-checkout-payment-initialize-options';

export default class PayPalCommerceAcceleratedCheckoutPaymentStrategy implements PaymentStrategy {
    private paypalConnectStyles?: PayPalCommerceConnectStylesOption;
    private paypalConnect?: PayPalCommerceConnect;
    private paypalConnectCardComponent?: PayPalCommerceConnectCardComponent;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private browserStorage: BrowserStorage, // TODO: should be changed to cookies implementation
    ) {}

    /**
     *
     * Default methods
     *
     * */
    async initialize(
        options: PaymentInitializeOptions &
            WithPayPalCommerceAcceleratedCheckoutPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommerceacceleratedcheckout } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommerceacceleratedcheckout) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerceacceleratedcheckout" argument is not provided.',
            );
        }

        if (
            !paypalcommerceacceleratedcheckout.onInit ||
            typeof paypalcommerceacceleratedcheckout.onInit !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerceacceleratedcheckout.onInit" argument is not provided or it is not a function.',
            );
        }

        // if (
        //     !paypalcommerceacceleratedcheckout.onChange ||
        //     typeof paypalcommerceacceleratedcheckout.onChange !== 'function'
        // ) {
        //     throw new InvalidArgumentError(
        //         'Unable to initialize payment because "options.paypalcommerceacceleratedcheckout.onChange" argument is not provided or it is not a function.',
        //     );
        // }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        this.paypalConnectStyles = paypalcommerceacceleratedcheckout.styles;
        this.paypalConnect = await this.initializePayPalConnect(methodId);

        if (this.shouldRunAuthenticationFlow()) {
            await this.runPayPalConnectAuthenticationFlowOrThrow(methodId);
        }

        this.initializeConnectCardComponent();

        paypalcommerceacceleratedcheckout.onInit((container: string) =>
            this.renderPayPalConnectCardComponent(container),
        );
        // paypalcommerceacceleratedcheckout.onChange((container: string) =>
        //     this.renderBraintreeAXOComponent(container),
        // );
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions,): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { paymentData, methodId } = payment;

        const paymentPayload =
            paymentData && isVaultedInstrument(paymentData)
                ? await this.prepareVaultedInstrumentPaymentPayload(methodId, paymentData)
                : await this.preparePaymentPayload(methodId, paymentData);

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(paymentPayload);

        this.browserStorage.removeItem('sessionId');
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        return Promise.resolve();
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
    private shouldRunAuthenticationFlow(): boolean {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const paymentProviderCustomer = state.getPaymentProviderCustomer();

        const paypalConnectSessionId = this.browserStorage.getItem('sessionId');

        if (
            paymentProviderCustomer?.authenticationState ===
            PayPalCommerceConnectAuthenticationState.CANCELED
        ) {
            return false;
        }

        return !paymentProviderCustomer?.authenticationState && paypalConnectSessionId === cart.id;
    }

    private async runPayPalConnectAuthenticationFlowOrThrow(methodId: string): Promise<void> {
        try {
            const { customerContextId } = await this.lookupCustomerOrThrow();
            const authenticationResult = await this.triggerAuthenticationFlowOrThrow(
                customerContextId,
            );

            await this.updateCustomerDataStateOrThrow(methodId, authenticationResult);
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
        methodId: string,
        authenticationResult?: PayPalCommerceConnectAuthenticationResult
    ): Promise<void> {
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
            ? this.mapPayPalToBcInstrument(paypalInstrument, methodId)
            : [];

        const addresses = this.mergeShippingAndBillingAddresses(shippingAddress, billingAddress);

        await this.paymentIntegrationService.updatePaymentProviderCustomer({
            authenticationState: authenticationState || PayPalCommerceConnectAuthenticationState.UNRECOGNIZED,
            addresses: addresses,
            instruments: instruments,
        });
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
        methodId: string,
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

    /**
     *
     * PayPalCommerce Connect Card Component rendering method
     *
     */
    private initializeConnectCardComponent() {
        const state = this.paymentIntegrationService.getState();
        const { phone } = state.getBillingAddressOrThrow();

        const cardComponentOptions: PayPalCommerceConnectCardComponentOptions = {
            fields: {
                ...(phone && {
                    phoneNumber: {
                        prefill: phone,
                    },
                }),
            },
        };

        const paypalConnect = this.getPayPalConnectOrThrow();

        this.paypalConnectCardComponent = paypalConnect.ConnectCardComponent(cardComponentOptions);
    }

    private renderPayPalConnectCardComponent(container?: string) {
        const paypalConnectCardComponent = this.getPayPalConnectCardComponentOrThrow();

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to render card component because "container" argument is not provided.',
            );
        }

        paypalConnectCardComponent.render(container);
    }

    private getPayPalConnectCardComponentOrThrow(): PayPalCommerceConnectCardComponent {
        if (!this.paypalConnectCardComponent) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalConnectCardComponent;
    }

    /**
     *
     * Payment Payload preparation methods
     *
     */
    private async prepareVaultedInstrumentPaymentPayload(
        methodId: string,
        paymentData: VaultedInstrument,
    ): Promise<Payment> {
        const { instrumentId } = paymentData;

        return {
            methodId,
            paymentData: {
                formattedPayload: {
                    paypal_connect_token: {
                        token: instrumentId,
                    },
                },
            },
        };
    }

    private async preparePaymentPayload(
        methodId: string,
        paymentData: OrderPaymentRequestBody['paymentData'],
    ): Promise<Payment> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        // Info: shipping can be unavailable for carts with digital items
        const shippingAddress = state.getShippingAddress();

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const paypalConnectCreditCardComponent = this.getPayPalConnectCardComponentOrThrow();

        const { nonce } = await paypalConnectCreditCardComponent.tokenize({
            billingAddress: this.mapToPayPalAddress(billingAddress),
            ...(shippingAddress && { shippingAddress: this.mapToPayPalAddress(shippingAddress) }),
        });

        return {
            methodId,
            paymentData: {
                ...paymentData,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                nonce,
            },
        };
    }

    private mapToPayPalAddress(address?: Address): PayPalCommerceConnectAddress {
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
}
