import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import {
    BraintreeDataCollector,
    BraintreeSdk,
    BraintreeVisaCheckout,
    VisaCheckoutAddress,
    VisaCheckoutPaymentSuccessPayload,
    VisaCheckoutTokenizedPayload,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    LegacyAddress,
    MissingDataError,
    MissingDataErrorType,
    NotImplementedError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithBraintreeVisaCheckoutCustomerInitializeOptions } from './braintree-visa-customer-initialize-options';

export default class BraintreeVisaCheckoutCustomerStrategy implements CustomerStrategy {
    private buttonClassName = 'visa-checkout-wrapper';
    private onError = noop;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private formPoster: FormPoster,
        private braintreeSdk: BraintreeSdk,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBraintreeVisaCheckoutCustomerInitializeOptions,
    ): Promise<void> {
        const { braintreevisacheckout: visaCheckoutOptions, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        if (!visaCheckoutOptions) {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.braintreevisacheckout" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();

        const checkout = state.getCheckoutOrThrow();

        const { clientToken, config } = state.getPaymentMethodOrThrow(methodId);

        const storeConfig = state.getStoreConfigOrThrow();

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreeSdk.initialize(clientToken, storeConfig);

        const braintreeVisaCheckout = await this.braintreeSdk.getBraintreeVisaCheckout();

        const visaCheckoutInstance = await this.braintreeSdk.getVisaCheckoutSdk(config.testMode);

        const { container, onError } = visaCheckoutOptions;

        this.onError = onError || noop;

        const initOptions = braintreeVisaCheckout.createInitOptions({
            paymentRequest: {
                currencyCode: storeConfig.currency.code,
                subtotal: String(checkout.subtotal),
            },
            settings: {
                locale: storeConfig.storeProfile.storeLanguage,
                shipping: {
                    collectShipping: true,
                },
            },
        });

        const signInButton = this.createSignInButton(container, this.buttonClassName);

        await visaCheckoutInstance.init(initOptions);

        visaCheckoutInstance.on(
            'payment.success',
            (paymentSuccessPayload: VisaCheckoutPaymentSuccessPayload) =>
                this.tokenizePayment(braintreeVisaCheckout, paymentSuccessPayload)
                    .then(() => this.paymentIntegrationService.loadCheckout())
                    .catch((error) => this.handleError(error)),
        );

        visaCheckoutInstance.on('payment.error', (_, error) => this.handleError(error));

        signInButton.style.visibility = 'visible';
    }

    async deinitialize(): Promise<void> {
        await this.braintreeSdk.deinitialize();
    }

    signIn(): Promise<void> {
        throw new NotImplementedError(
            'In order to sign in via VisaCheckout, the shopper must click on "Visa Checkout" button.',
        );
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);

        return Promise.resolve();
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private async tokenizePayment(
        braintreeVisaCheckout: BraintreeVisaCheckout,
        payment: VisaCheckoutPaymentSuccessPayload,
    ) {
        return Promise.all([
            braintreeVisaCheckout.tokenize(payment),
            this.braintreeSdk.getDataCollectorOrThrow(),
        ]).then(([payload, deviceData]) => {
            const state = this.paymentIntegrationService.getState();

            const shipping = state.getShippingAddress();
            const billing = state.getBillingAddress();

            const {
                shippingAddress = this.mapToVisaCheckoutAddress(shipping),
                billingAddress = this.mapToVisaCheckoutAddress(billing),
            } = payload;

            return this.postForm(
                {
                    ...payload,
                    shippingAddress,
                    billingAddress,
                },
                deviceData,
            );
        });
    }

    private postForm(
        paymentData: VisaCheckoutTokenizedPayload,
        dataCollector: BraintreeDataCollector,
    ) {
        const { userData, billingAddress, shippingAddress, details: cardInformation } = paymentData;
        const { userEmail } = userData;
        const { deviceData } = dataCollector;

        return this.formPoster.postForm('/checkout.php', {
            payment_type: paymentData.type,
            nonce: paymentData.nonce,
            provider: 'braintreevisacheckout',
            action: 'set_external_checkout',
            device_data: deviceData,
            card_information: JSON.stringify({
                type: cardInformation.cardType,
                number: cardInformation.lastTwo,
            }),
            billing_address: JSON.stringify(this.getAddress(userEmail, billingAddress)),
            shipping_address: JSON.stringify(this.getAddress(userEmail, shippingAddress)),
        });
    }

    private mapToVisaCheckoutAddress(address?: Address): VisaCheckoutAddress {
        if (!address) {
            return {};
        }

        return {
            firstName: address.firstName,
            lastName: address.lastName,
            phoneNumber: address.phone,
            streetAddress: address.address1,
            extendedAddress: address.address2,
            locality: address.city,
            region: address.stateOrProvinceCode,
            countryCode: address.countryCode,
            postalCode: address.postalCode,
        };
    }

    private getAddress(email: string, address: VisaCheckoutAddress = {}): Partial<LegacyAddress> {
        return {
            email,
            first_name: address.firstName,
            last_name: address.lastName,
            phone_number: address.phoneNumber,
            address_line_1: address.streetAddress,
            address_line_2: address.extendedAddress,
            city: address.locality,
            state: address.region,
            country_code: address.countryCode,
            postal_code: address.postalCode,
        };
    }

    private createSignInButton(containerId: string, buttonClass: string): HTMLElement {
        const container = document.querySelector(`#${containerId}`);

        if (!container) {
            throw new Error('Unable to proceed because the provided container ID is not valid.');
        }

        return this.insertVisaCheckoutButton(container, buttonClass);
    }

    private insertVisaCheckoutButton(container: Element, buttonClass: string): HTMLElement {
        const buttonSource =
            'https://secure.checkout.visa.com/wallet-services-web/xo/button.png?acceptCanadianVisaDebit=false&cobrand=true&height=34&width=178';
        const buttonTemplate = `
            <img
                alt="Visa Checkout"
                class="v-button"
                role="button"
                src="${buttonSource}"
                />
            <a class="v-learn v-learn-default" style="text-align: right; display: block; font-size: 10px; color: #003366;" href="#" data-locale="en_US">Tell Me More</a>`;

        const visaCheckoutButton = document.createElement('div');

        visaCheckoutButton.style.display = 'flex';
        visaCheckoutButton.style.flexDirection = 'column';
        visaCheckoutButton.style.visibility = 'hidden';
        visaCheckoutButton.style.width = 'max-content';

        visaCheckoutButton.className = buttonClass;
        visaCheckoutButton.innerHTML = buttonTemplate;

        container.appendChild(visaCheckoutButton);

        return visaCheckoutButton;
    }

    private handleError(error: Error) {
        if (typeof this.onError === 'function') {
            this.onError(error);
        } else {
            throw error;
        }
    }
}
