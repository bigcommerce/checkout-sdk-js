import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import {
    BraintreeError,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreeIntegrationService,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeTokenizePayload,
    isBraintreeError,
    PaypalAuthorizeData,
    PaypalStyleOptions,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    DefaultCheckoutButtonHeight,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    RequestOptions,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreePaypalCreditCustomerInitializeOptions, {
    WithBraintreePaypalCreditCustomerInitializeOptions,
} from './braintree-paypal-credit-customer-options';

export default class BraintreePaypalCreditCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private formPoster: FormPoster,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBraintreePaypalCreditCustomerInitializeOptions,
    ): Promise<void> {
        const { braintreepaypalcredit, methodId } = options;
        const { container, onError } = braintreepaypalcredit || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!braintreepaypalcredit) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypalcredit" argument is not provided.`,
            );
        }

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypalcredit.container" argument is not provided.`,
            );
        }

        let state = this.paymentIntegrationService.getState();
        let paymentMethod: PaymentMethod<BraintreeInitializationData>;

        try {
            paymentMethod = state.getPaymentMethodOrThrow(methodId);
        } catch (_e) {
            state = await this.paymentIntegrationService.loadPaymentMethod(methodId);
            paymentMethod = state.getPaymentMethodOrThrow(methodId);
        }

        const storeConfig = state.getStoreConfigOrThrow();

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
                braintreepaypalcredit,
                methodId,
                Boolean(config.testMode),
                { ...checkoutTopButtonStyles, height: DefaultCheckoutButtonHeight },
            );
        };
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this.handleError(error, container, onError);

        this.braintreeIntegrationService.initialize(clientToken, storeConfig);
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
        braintreepaypalcredit: BraintreePaypalCreditCustomerInitializeOptions,
        methodId: string,
        testMode: boolean,
        buttonStyles: PaypalStyleOptions,
    ): void {
        const { container, onClick = noop } = braintreepaypalcredit;
        const { paypal } = this.braintreeHostWindow;

        let hasRenderedSmartButton = false;

        if (paypal) {
            const fundingSources = [paypal.FUNDING.PAYLATER, paypal.FUNDING.CREDIT];

            fundingSources.forEach((fundingSource) => {
                if (!hasRenderedSmartButton) {
                    const paypalButtonRender = paypal.Buttons({
                        env: testMode ? 'sandbox' : 'production',
                        commit: false,
                        fundingSource,
                        style: buttonStyles,
                        createOrder: () =>
                            this.setupPayment(
                                braintreePaypalCheckout,
                                braintreepaypalcredit,
                                methodId,
                            ),
                        onApprove: (authorizeData: PaypalAuthorizeData) =>
                            this.tokenizePayment(
                                authorizeData,
                                braintreePaypalCheckout,
                                methodId,
                                braintreepaypalcredit,
                            ),
                        onClick,
                    });

                    if (paypalButtonRender.isEligible()) {
                        paypalButtonRender.render(`#${container}`);
                        hasRenderedSmartButton = true;
                    }
                }
            });
        }

        if (!paypal || !hasRenderedSmartButton) {
            this.braintreeIntegrationService.removeElement(container);
        }
    }

    private async setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypalcredit: BraintreePaypalCreditCustomerInitializeOptions,
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
                offerCredit: true,
                intent: paymentMethod.initializationData?.intent,
            });
        } catch (error) {
            const { container, onError } = braintreepaypalcredit;

            this.handleError(error, container, onError);
        }
    }

    private async tokenizePayment(
        authorizeData: PaypalAuthorizeData,
        braintreePaypalCheckout: BraintreePaypalCheckout,
        methodId: string,
        braintreepaypalcredit: BraintreePaypalCreditCustomerInitializeOptions,
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
            const { container, onError } = braintreepaypalcredit;

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
