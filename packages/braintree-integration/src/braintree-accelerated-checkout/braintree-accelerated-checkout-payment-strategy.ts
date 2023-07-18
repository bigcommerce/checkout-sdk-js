import { noop } from 'lodash';

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

import BraintreeIntegrationService from '../braintree-integration-service';
import {
    BraintreeConnectAddress,
    BraintreeConnectCardComponent,
    BraintreeConnectCardComponentOptions,
} from '../braintree';

import {
    WithBraintreeAcceleratedCheckoutPaymentInitializeOptions
} from './braintree-accelerated-checkout-payment-initialize-options';

export default class BraintreeAcceleratedCheckoutPaymentStrategy implements PaymentStrategy {
    private onError = noop;
    private braintreeConnectCardComponent?: BraintreeConnectCardComponent;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeAcceleratedCheckoutPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, braintreeacceleratedcheckout } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!braintreeacceleratedcheckout) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.', // TODO: update method
            );
        }

        const state = await this.paymentIntegrationService.loadPaymentMethod(methodId);
        const { phone } = state.getBillingAddressOrThrow();
        const { clientToken } = state.getPaymentMethodOrThrow(methodId);


        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken);

            const cardComponentOptions: BraintreeConnectCardComponentOptions = {
                fields: {
                    ...(phone && {
                        phoneNumber: {
                            prefill: phone,
                        },
                    }),
                },
            };

            const braintreeConnect = await this.braintreeIntegrationService.getBraintreeConnect();
            this.braintreeConnectCardComponent = braintreeConnect.ConnectCardComponent(cardComponentOptions);
            this.braintreeConnectCardComponent.render(`#${braintreeacceleratedcheckout.containerId}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            const paymentPayload = await this.preparePaymentPayload(payment);

            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            this.handleError(error)
        }
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
        const shippingAddress = state.getShippingAddressOrThrow();

        const {
            shouldSaveInstrument = false,
            shouldSetAsDefaultInstrument = false,
        } = isHostedInstrumentLike(paymentData) ? paymentData : {};

        const braintreeConnectCreditCardComponent = this.getBraintreeCardComponentOrThrow();

        const paypalBillingAddress = this.mapToPayPalAddress(billingAddress);
        const paypalShippingAddress = this.mapToPayPalAddress(shippingAddress);

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

    private mapToPayPalAddress(address: Address): BraintreeConnectAddress {
        return {
            streetAddress: address.address1,
            locality: address.city,
            region: address.stateOrProvinceCode,
            postalCode: address.postalCode,
            countryCodeAlpha2: address.countryCode,
        };
    }

    private getBraintreeCardComponentOrThrow() {
        if (!this.braintreeConnectCardComponent) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeConnectCardComponent;
    }

    private handleError(error: Error) {
        if (typeof this.onError === 'function') {
            this.onError(error);
        } else {
            throw error;
        }
    }
}
