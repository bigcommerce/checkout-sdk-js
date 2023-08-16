import { FormPoster } from '@bigcommerce/form-poster';

import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    RequestOptions,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeError,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeTokenizePayload,
} from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import isBraintreeError from '../is-braintree-error';
import { PaypalAuthorizeData, PaypalStyleOptions } from '../paypal';

import BraintreePaypalCustomerInitializeOptions, {
    WithBraintreePaypalCustomerInitializeOptions,
} from './braintree-paypal-customer-options';

export default class BraintreePaypalCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private formPoster: FormPoster,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBraintreePaypalCustomerInitializeOptions,
    ): Promise<void> {
        const { braintreepaypal, methodId } = options;
        const { container, onError } = braintreepaypal || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!braintreepaypal) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypal" argument is not provided.`,
            );
        }

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypal.container" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod: PaymentMethod<BraintreeInitializationData> =
            state.getPaymentMethodOrThrow(methodId);

        const { clientToken, config, initializationData } = paymentMethod;
        const { paymentButtonStyles } = initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const currencyCode = state.getCartOrThrow().currency.code;
        const paypalCheckoutOptions: Partial<BraintreePaypalSdkCreatorConfig> = {
            currency: currencyCode,
            intent: initializationData.intent,
            isCreditEnabled: initializationData.isCreditEnabled,
        };

        const paypalCheckoutSuccessCallback = (
            braintreePaypalCheckout: BraintreePaypalCheckout,
        ) => {
            this.renderPayPalButton(
                braintreePaypalCheckout,
                braintreepaypal,
                container,
                methodId,
                Boolean(config.testMode),
                checkoutTopButtonStyles,
            );
        };
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this.handleError(error, container, onError);

        this.braintreeIntegrationService.initialize(clientToken, initializationData);
        await this.braintreeIntegrationService.getPaypalCheckout(
            paypalCheckoutOptions,
            paypalCheckoutSuccessCallback,
            paypalCheckoutErrorCallback,
        );
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

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private renderPayPalButton(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypal: BraintreePaypalCustomerInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
        buttonStyles: PaypalStyleOptions,
    ): void {
        const { paypal } = this.braintreeHostWindow;
        const fundingSource = paypal?.FUNDING.PAYPAL;

        if (paypal && fundingSource) {
            const paypalButtonRender = paypal.Buttons({
                env: this.braintreeIntegrationService.getBraintreeEnv(testMode),
                commit: false,
                fundingSource,
                style: { ...buttonStyles, height: 36 },
                createOrder: () =>
                    this.setupPayment(braintreePaypalCheckout, braintreepaypal, methodId),
                onApprove: (authorizeData: PaypalAuthorizeData) =>
                    this.tokenizePayment(
                        authorizeData,
                        braintreePaypalCheckout,
                        methodId,
                        braintreepaypal,
                    ),
            });

            if (paypalButtonRender.isEligible()) {
                paypalButtonRender.render(`#${containerId}`);
            }
        } else {
            this.braintreeIntegrationService.removeElement(containerId);
        }
    }

    private async setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypal: BraintreePaypalCustomerInitializeOptions,
        methodId: string,
    ): Promise<string | void> {
        try {
            await this.paymentIntegrationService.loadDefaultCheckout();

            const state = this.paymentIntegrationService.getState();
            const amount = state.getCheckoutOrThrow().outstandingBalance;
            const currency = state.getCartOrThrow().currency.code;
            const customer = state.getCustomer();
            const paymentMethod: PaymentMethod<BraintreeInitializationData> =
                state.getPaymentMethodOrThrow(methodId);
            const address = customer?.addresses[0];
            const shippingAddressOverride = address
                ? this.braintreeIntegrationService.mapToBraintreeShippingAddressOverride(address)
                : undefined;

            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride,
                amount,
                currency,
                offerCredit: false,
                intent: paymentMethod.initializationData?.intent,
            });
        } catch (error) {
            const { container, onError } = braintreepaypal;

            this.handleError(error, container, onError);
        }
    }

    private async tokenizePayment(
        authorizeData: PaypalAuthorizeData,
        braintreePaypalCheckout: BraintreePaypalCheckout,
        methodId: string,
        braintreepaypal: BraintreePaypalCustomerInitializeOptions,
    ): Promise<BraintreeTokenizePayload | void> {
        try {
            const { deviceData } = await this.braintreeIntegrationService.getDataCollector({
                paypal: true,
            });
            const tokenizePayload = await braintreePaypalCheckout.tokenizePayment(authorizeData);
            const { details, nonce } = tokenizePayload;
            const billingAddress =
                this.braintreeIntegrationService.mapToLegacyBillingAddress(details);
            const shippingAddress =
                this.braintreeIntegrationService.mapToLegacyShippingAddress(details);

            this.formPoster.postForm('/checkout.php', {
                payment_type: 'paypal',
                provider: methodId,
                action: 'set_external_checkout',
                nonce,
                device_data: deviceData,
                billing_address: JSON.stringify(billingAddress),
                shipping_address: JSON.stringify(shippingAddress),
            });

            return tokenizePayload;
        } catch (error) {
            const { container, onError } = braintreepaypal;

            this.handleError(error, container, onError);
        }
    }

    private handleError(
        error: unknown,
        buttonContainerId: string,
        onErrorCallback?: (error: BraintreeError | StandardError) => void,
    ): void {
        this.braintreeIntegrationService.removeElement(buttonContainerId);

        if (onErrorCallback && isBraintreeError(error)) {
            onErrorCallback(error);
        } else {
            throw error;
        }
    }
}
