import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody, PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService, PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';

import {
    WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk/paypal-commerce-integration';
import {PayPalCommerceInitializationData} from "../paypal-commerce-types";

export default class PayPalCommerceAlternativeMethodRatePayPaymentStrategy implements PaymentStrategy {
    private ratePayButton?: any; // TODO: FIX
    private loadingIndicatorContainer?: string;
    private guid?: string;
    private paypalcommerceratepay?: any; // TODO: FIX
    private orderId?: string;
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options: PaymentInitializeOptions &
            WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions,
    ): Promise<void> {
        const {
            gatewayId,
            methodId,
            paypalcommerceratepay
        } = options;

        console.log(paypalcommerceratepay); // TODO: REMOVE

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.gatewayId" argument is not provided.',
            );
        }

        if (!paypalcommerceratepay) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerceratepay" argument is not provided.`,
            );
        }

        this.paypalcommerceratepay = paypalcommerceratepay;

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
            methodId,
            gatewayId,
        );

        const { merchantId } = paymentMethod.initializationData || {};

        this.loadingIndicatorContainer = paypalcommerceratepay.container.split('#')[1];

        this.createFraudNetScript(merchantId || '');
        this.loadFraudnetConfig();

        this.renderLegalText();
        this.renderButton(methodId, gatewayId);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this.orderId) {
            throw new PaymentMethodInvalidError();
        }

        const { dateOfBirthContainer } = this.paypalcommerceratepay || {};

        const dateOfBirthValue = document.getElementById(dateOfBirthContainer)?.innerText;

        const ratePay = {
            birthDate: dateOfBirthValue,
        };

        await this.paymentIntegrationService.submitOrder(order, options);

        await this.paypalCommerceIntegrationService.submitPayment(payment.methodId, this.orderId, ratePay);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        const legalTextContainer = document.getElementById('legal-text-container'); //TODO: FIX
        legalTextContainer?.remove();

        return Promise.resolve();
    }

    private renderButton(methodId: string, _gatewayId: string) { // TODO: FIX
        if (this.paypalcommerceratepay) {
            let buttonContainer;
            const { buttonText, container, onRenderButton } = this.paypalcommerceratepay;
            const buttonContainerId = container.split('#')[1];
            const ratepayButton = document.createElement('button');
            buttonContainer = document.getElementById(buttonContainerId);
            ratepayButton.setAttribute('class', 'button button--action button--large button--slab optimizedCheckout-buttonPrimary');
            ratepayButton.setAttribute('id', methodId);
            ratepayButton.innerText = buttonText || 'Continue with Ratepay';
            ratepayButton.addEventListener('click', (e) => this.handleClick(e));

            if (onRenderButton && typeof onRenderButton === 'function') {
                onRenderButton();
            }

            buttonContainer = document.getElementById(buttonContainerId);

            if (buttonContainer) {
                buttonContainer.append(ratepayButton);
            }
        }
    }

    private renderLegalText() { //TODO: FIX
        const { container } = this.paypalcommerceratepay;
        const buttonContainerId = container.split('#')[1];
        const buttonContainer = document.getElementById(buttonContainerId);
        const buttonContainerParent = buttonContainer?.parentNode;
        const legalTextContainer = document.createElement('div');
        legalTextContainer.style.marginBottom = '20px'; // TODO: FIX
        legalTextContainer.setAttribute('id', 'legal-text-container');
        buttonContainerParent?.prepend(legalTextContainer);
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        this.ratePayButton = paypalSdk.Legal({fundingSource: paypalSdk.Legal.FUNDING.PAY_UPON_INVOICE});
        console.log('RATE PAY', this.ratePayButton);
        this.ratePayButton.render('#legal-text-container'); // TODO: FIX
    }

    private async handleClick(e: any): Promise<void> { // TODO: FIX
        e.preventDefault();
        const { submitForm } = this.paypalcommerceratepay;
        try {
            await this.paypalCommerceIntegrationService.createOrder(
                'paypalcommercealternativemethodscheckout',
                { metadataId: this.guid }
            );

            if (submitForm && typeof submitForm === 'function') {
                submitForm();
            }

        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    private handleError(
        error: unknown
    ): void {
        const { onError } = this.paypalcommerceratepay;
        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }

    private createFraudNetScript(merchantId: string) {
        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/json');
        scriptElement.setAttribute('fncls', 'fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99');
        this.guid = this.generateGUID();
        const jsonObject = {
            f: this.guid,
            s: `${merchantId}_checkout-page`,
            sandbox: 'true' // TODO: FIX make dynamic
        };

        scriptElement.innerHTML = JSON.stringify(jsonObject);

        document.body.appendChild(scriptElement);
    }

    private loadFraudnetConfig() {
        const script = document.createElement('script');
        script.src = 'https://c.paypal.com/da/r/fb.js';
        document.body.appendChild(script);
    }

    private generateGUID() {
        const chars = 'abcdef0123456789';
        let guid = '';

        for (let i = 0; i < 32; i++) {
            const index = Math.floor(Math.random() * chars.length);
            guid += chars.charAt(index);
        }

        return guid;
    }

    /**
     *
     * Loading Indicator methods
     *
     * */
    // @ts-ignore
    private toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this.loadingIndicatorContainer) {
            this.loadingIndicator.show(this.loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
    }
}
