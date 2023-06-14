import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';

import PayPalCommerceAlternativeMethodsPaymentOptions, {
    WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions,
} from './paypal-commerce-alternative-methods-payment-initialize-options';
//import { PayPalCommerceButtonsOptions } from "../paypal-commerce-types";

export default class PayPalCommerceAlternativeMethodRatePayPaymentStrategy implements PaymentStrategy {
    private orderId?: string;
    private ratePayButton?: any; // TODO: FIX
    private loadingIndicatorContainer?: string;

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

        console.log(
            options,this.paymentIntegrationService,
            this.paypalCommerceIntegrationService,
            this.handleError,
            this.toggleLoadingIndicator,
            gatewayId,
            methodId,
            paypalcommerceratepay,
            this.orderId,
        ); // TODO: REMOVE

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

        console.log('PAYPALCOMMERCERATEPAY', paypalcommerceratepay);

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        this.loadingIndicatorContainer = paypalcommerceratepay.container.split('#')[1];

        this.renderButton(methodId, gatewayId, paypalcommerceratepay);
        this.renderFields(methodId, paypalcommerceratepay);
        this.renderLegalText(paypalcommerceratepay);
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        console.log('EXECUTE', payload, options);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {

        return Promise.resolve();
    }

    private renderButton(methodId: string, _gatewayId: string, paypalcommerceratepay: any) { // TODO: FIX
        if (paypalcommerceratepay) {
            let buttonContainer;
            const { buttonText, container, onRenderButton } = paypalcommerceratepay;
            const buttonContainerId = container.split('#')[1];
            const ratepayButton = document.createElement('button');
            buttonContainer = document.getElementById(buttonContainerId);
            const className = buttonContainer?.getAttribute('class');
            ratepayButton.setAttribute('class', className || '');
            ratepayButton.setAttribute('id', methodId);
            ratepayButton.innerText = buttonText || 'Place Order';
            ratepayButton.addEventListener('click', () => this.handleClick(paypalcommerceratepay));

            if (onRenderButton && typeof onRenderButton === 'function') {
                onRenderButton();
            }

            buttonContainer = document.getElementById(buttonContainerId);

            if (buttonContainer) {
                buttonContainer.append(ratepayButton);
            }
        }
    }

    private renderLegalText(_paypalcommerceratepay: any) { //TODO: FIX
        console.log(this.ratePayButton);
        // const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        // const { container } = paypalcommerceratepay;
        // this.ratePayButton = paypalSdk.Legal({ fundingSource: paypalSdk.Legal.FUNDING.PAY_UPON_INVOICE });
        // this.ratePayButton.render(container);
    }

    private renderFields(
        methodId: string,
        paypalcommerceratepay: PayPalCommerceAlternativeMethodsPaymentOptions,
    ): void {
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const { apmFieldsContainer, apmFieldsStyles } = paypalcommerceratepay;

        if (!apmFieldsContainer) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerceratepay" argument should contain "apmFieldsContainer".',
            );
        }

        const fieldContainerElement = document.querySelector(apmFieldsContainer);

        if (fieldContainerElement) {
            fieldContainerElement.innerHTML = '';
        }

        const fieldsOptions = {
            fundingSource: methodId,
            style: apmFieldsStyles || {},
            fields: {
                birthDate: {
                    value: '',
                },
            },
        };

        const paypalPaymentFields = paypalSdk.PaymentFields(fieldsOptions);

        paypalPaymentFields.render(apmFieldsContainer);
    }

    private handleClick(paypalcommerceratepay: any) { // TODO: FIX
        const { submitForm } = paypalcommerceratepay;

        if(submitForm && typeof submitForm === 'function') {
            submitForm();
        }
    }

    private handleError(
        error: Error,
        onError: PayPalCommerceAlternativeMethodsPaymentOptions['onError'],
    ): void {
        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }


    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this.loadingIndicatorContainer) {
            this.loadingIndicator.show(this.loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
    }
}
