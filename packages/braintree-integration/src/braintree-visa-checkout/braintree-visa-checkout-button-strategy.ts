import { FormPoster } from '@bigcommerce/form-poster';

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
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    LegacyAddress,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class BraintreeVisaCheckoutButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private formPoster: FormPoster,
        private braintreeSdk: BraintreeSdk,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();

        const { clientToken, initializationData, config } = state.getPaymentMethodOrThrow(methodId);

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreeSdk.initialize(clientToken);

        const braintreeVisaCheckout = await this.braintreeSdk.getBraintreeVisaCheckout();

        const {
            currency: { code },
            cartAmount,
        } = state.getCartOrThrow();

        const visaCheckoutInstance = await this.braintreeSdk.getVisaCheckoutSdk(config.testMode);

        const initOptions = braintreeVisaCheckout.createInitOptions({
            paymentRequest: {
                currencyCode: code,
                subtotal: String(cartAmount),
            },
            settings: {
                shipping: {
                    collectShipping: true,
                },
            },
        });

        this.createSignInButton(containerId);

        await visaCheckoutInstance.init(initOptions);

        visaCheckoutInstance.on('payment.success', async (payment) => {
            await this.paymentSuccess(braintreeVisaCheckout, payment);
        });
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private async paymentSuccess(
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
                shippingAddress = this.toVisaCheckoutAddress(shipping),
                billingAddress = this.toVisaCheckoutAddress(billing),
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

    private toVisaCheckoutAddress(address?: Address): VisaCheckoutAddress {
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

    private createSignInButton(containerId: string): HTMLElement {
        const container = document.querySelector(`#${containerId}`);

        if (!container) {
            throw new Error('Need a container to place the button');
        }

        return this.insertVisaCheckoutButton(container);
    }

    private insertVisaCheckoutButton(container: Element): HTMLElement {
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
        visaCheckoutButton.style.alignItems = 'flex-end';

        visaCheckoutButton.innerHTML = buttonTemplate;

        container.appendChild(visaCheckoutButton);

        return visaCheckoutButton;
    }
}
