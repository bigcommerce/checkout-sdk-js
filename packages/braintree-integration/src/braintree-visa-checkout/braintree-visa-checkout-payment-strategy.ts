import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import {
    BraintreeDataCollector,
    BraintreeInitializationData,
    BraintreeSdk,
    BraintreeVisaCheckout,
    VisaCheckoutAddress,
    VisaCheckoutPaymentSuccessPayload,
    VisaCheckoutTokenizedPayload,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address,
    InvalidArgumentError,
    LegacyAddress,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithBraintreeVisaCheckoutPaymentInitializeOptions } from './braintree-visa-checkout-payment-options';

export default class BraintreeVisaCheckoutPaymentStrategy implements PaymentStrategy {
    private paymentMethod?: PaymentMethod<BraintreeInitializationData>;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private formPoster: FormPoster,
        private braintreeSdk: BraintreeSdk,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeVisaCheckoutPaymentInitializeOptions,
    ): Promise<void> {
        const { braintreevisacheckout: visaCheckoutOptions, methodId } = options;

        if (!visaCheckoutOptions) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreevisacheckout" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();

        this.paymentMethod = state.getPaymentMethodOrThrow(methodId);

        const checkout = state.getCheckoutOrThrow();
        const storeConfig = state.getStoreConfigOrThrow();

        const { clientToken, config } = this.paymentMethod || {};

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { onError = noop, onPaymentSelect = noop } = visaCheckoutOptions;

        this.braintreeSdk.initialize(clientToken);

        const braintreeVisaCheckout = await this.braintreeSdk.getBraintreeVisaCheckout();

        const visaCheckoutSdk = await this.braintreeSdk.getVisaCheckoutSdk(config?.testMode);

        const initOptions = braintreeVisaCheckout.createInitOptions({
            settings: {
                locale: storeConfig.storeProfile.storeLanguage,
                shipping: {
                    collectShipping: false,
                },
            },
            paymentRequest: {
                currencyCode: storeConfig.currency.code,
                subtotal: String(checkout.subtotal),
            },
        });

        await visaCheckoutSdk.init(initOptions);

        visaCheckoutSdk.on(
            'payment.success',
            (paymentSuccessPayload: VisaCheckoutPaymentSuccessPayload) =>
                this.tokenizePayment(braintreeVisaCheckout, paymentSuccessPayload)
                    .then(() =>
                        Promise.all([
                            this.paymentIntegrationService.loadCheckout(),
                            this.paymentIntegrationService.loadPaymentMethod(methodId),
                        ]),
                    )
                    .then(() => onPaymentSelect())
                    .catch((error) => onError(error)),
        );
        visaCheckoutSdk.on('payment.error', (_, error) => onError(error));
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new InvalidArgumentError(
                'Unable to submit payment because "payload.payment" argument is not provided.',
            );
        }

        if (!this.paymentMethod?.initializationData?.nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { nonce } = this.paymentMethod.initializationData;

        try {
            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: { nonce },
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    finalize(): Promise<any> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        await this.braintreeSdk.deinitialize();
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

    private handleError(error: unknown): never {
        if (error instanceof Error && error.name === 'BraintreeError') {
            throw new PaymentMethodFailedError(error.message);
        }

        throw error;
    }
}
