import {
    Address,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    PaymentRequestOptions,
    PaymentStrategy,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeConnectAddress,
    BraintreeConnectCardComponent,
    BraintreeConnectCardComponentOptions,
} from '../braintree';

import { WithBraintreeAcceleratedCheckoutPaymentInitializeOptions } from './braintree-accelerated-checkout-payment-initialize-options';
import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

export default class BraintreeAcceleratedCheckoutPaymentStrategy implements PaymentStrategy {
    private braintreeConnectCardComponent?: BraintreeConnectCardComponent;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeAcceleratedCheckoutUtils: BraintreeAcceleratedCheckoutUtils,
    ) {}

    /**
     *
     * Default methods
     *
     * */
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

        if (
            !braintreeacceleratedcheckout.onInit ||
            typeof braintreeacceleratedcheckout.onInit !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreeacceleratedcheckout.onInit" argument is not provided or it is not a function.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);
        await this.braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow(methodId);

        this.initializeConnectCardComponent();

        braintreeacceleratedcheckout.onInit((container) =>
            this.renderBraintreeAXOComponent(container),
        );
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
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
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.braintreeConnectCardComponent = undefined;

        return Promise.resolve();
    }

    /**
     *
     * Braintree AXO Component rendering method
     *
     */
    private initializeConnectCardComponent() {
        const state = this.paymentIntegrationService.getState();
        const { phone } = state.getBillingAddressOrThrow();

        const cardComponentOptions: BraintreeConnectCardComponentOptions = {
            fields: {
                ...(phone && {
                    phoneNumber: {
                        prefill: phone,
                    },
                }),
            },
        };

        const paypalConnectCreditCardComponent =
            this.braintreeAcceleratedCheckoutUtils.getBraintreeConnectComponentOrThrow();

        this.braintreeConnectCardComponent = paypalConnectCreditCardComponent(cardComponentOptions);
    }

    private renderBraintreeAXOComponent(container?: string) {
        const braintreeConnectCardComponent = this.getBraintreeCardComponentOrThrow();

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "container" argument is not provided.',
            );
        }

        braintreeConnectCardComponent.render(container);
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
        const deviceSessionId = await this.braintreeAcceleratedCheckoutUtils.getDeviceSessionId();

        const { instrumentId } = paymentData;

        return {
            methodId,
            paymentData: {
                ...paymentData,
                instrumentId,
                deviceSessionId,
                ...(this.isPayPalCommerceInstrument(instrumentId) && {
                    tokenType: 'paypal_connect',
                }),
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

    /**
     *
     * Other methods
     *
     */
    private getBraintreeCardComponentOrThrow() {
        if (!this.braintreeConnectCardComponent) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeConnectCardComponent;
    }

    private isPayPalCommerceInstrument(instrumentId: string): boolean {
        const state = this.paymentIntegrationService.getState();
        const { instruments } = state.getPaymentProviderCustomerOrThrow();

        const paypalConnectInstruments = instruments || [];

        return !!paypalConnectInstruments.find(
            (instrument) => instrument.bigpayToken === instrumentId,
        );
    }
}
