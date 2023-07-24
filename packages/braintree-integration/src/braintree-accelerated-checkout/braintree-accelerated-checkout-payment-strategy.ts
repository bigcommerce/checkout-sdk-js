import {
    Address,
    InvalidArgumentError,
    isHostedInstrumentLike,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeConnectAddress,
    BraintreeConnectCardComponent,
    BraintreeConnectCardComponentOptions,
    BraintreeInitializationData,
} from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';

import { WithBraintreeAcceleratedCheckoutPaymentInitializeOptions } from './braintree-accelerated-checkout-payment-initialize-options';

export default class BraintreeAcceleratedCheckoutPaymentStrategy implements PaymentStrategy {
    private braintreeConnectCardComponent?: BraintreeConnectCardComponent;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions &
            WithBraintreeAcceleratedCheckoutPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, braintreeacceleratedcheckout } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!braintreeacceleratedcheckout) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreeacceleratedcheckout" argument is not provided.',
            );
        }

        if (!braintreeacceleratedcheckout.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreeacceleratedcheckout.container" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const { phone } = state.getBillingAddressOrThrow();
        const { clientToken, initializationData } =
            state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreeIntegrationService.initialize(clientToken, initializationData);

        const cardComponentOptions: BraintreeConnectCardComponentOptions = {
            fields: {
                ...(phone && {
                    phoneNumber: {
                        prefill: phone,
                    },
                }),
            },
        };

        const { ConnectCardComponent } =
            await this.braintreeIntegrationService.getBraintreeConnect();

        this.braintreeConnectCardComponent = ConnectCardComponent(cardComponentOptions);
        this.braintreeConnectCardComponent.render(braintreeacceleratedcheckout.container);
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const paymentPayload = await this.preparePaymentPayload(payment);

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(paymentPayload);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.braintreeConnectCardComponent = undefined;

        await this.braintreeIntegrationService.teardown();

        return Promise.resolve();
    }

    private async preparePaymentPayload(payment: OrderPaymentRequestBody) {
        const { methodId, paymentData } = payment;

        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        // Info: shipping can be unavailable for carts with digital items
        const shippingAddress = state.getShippingAddress();

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const braintreeConnectCreditCardComponent = this.getBraintreeCardComponentOrThrow();

        const paypalBillingAddress = this.mapToPayPalAddress(billingAddress);
        const paypalShippingAddress = shippingAddress && this.mapToPayPalAddress(shippingAddress);

        const { nonce } = await braintreeConnectCreditCardComponent.tokenize({
            billingAddress: paypalBillingAddress,
            ...(paypalShippingAddress && { shippingAddress: paypalShippingAddress }),
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

    private mapToPayPalAddress(address?: Address): BraintreeConnectAddress {
        return {
            streetAddress: address?.address1 || '',
            locality: address?.city || '',
            region: address?.stateOrProvinceCode || '',
            postalCode: address?.postalCode || '',
            countryCodeAlpha2: address?.countryCode || '',
        };
    }

    private getBraintreeCardComponentOrThrow() {
        if (!this.braintreeConnectCardComponent) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeConnectCardComponent;
    }
}
