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

        this.renderLegalText(paypalcommerceratepay);
        this.renderButton(methodId, gatewayId, paypalcommerceratepay);
        this.renderFields();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        console.log(payload, options);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {

        return Promise.resolve();
    }

    private renderButton(methodId: string, gatewayId: string, paypalcommerceratepay: any) { // TODO: FIX
        console.log('RENDER BUTTON', methodId, gatewayId, paypalcommerceratepay);
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const { container, onError, onRenderButton, submitForm } = paypalcommerceratepay;
        console.log(onError, submitForm, container);

        console.log('PAYPAL SDK', paypalSdk);

        const buttonOptions: any = {
            fundingSource: methodId,
            style: {},
            createOrder: () => {
              return this.paypalCommerceIntegrationService.createOrder(  // TODO: FIX
                    'paypalcommercealternativemethodscheckout',
                )
            },
            onClick: () => {},
            onApprove: () => {},
            // onCancel: () => this.resetPollingMechanism(),
            onError: () => {},
        };

        this.ratePayButton = paypalSdk.Legal({ fundingSource: paypalSdk.Legal.FUNDING.PAY_UPON_INVOICE });
        console.log('RATE PAY BUTTON', this.ratePayButton);
        console.log(paypalSdk.Buttons(buttonOptions));

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }


        // paypalSdk.Buttons(buttonOptions).render(container);
    }

    private renderLegalText(paypalcommerceratepay: any) { //TODO: FIX
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const { container } = paypalcommerceratepay;
        this.ratePayButton = paypalSdk.Legal({ fundingSource: paypalSdk.Legal.FUNDING.PAY_UPON_INVOICE });
        this.ratePayButton.render(container);
    }
    private renderFields(
        methodId: string,
        paypalOptions: PayPalCommerceAlternativeMethodsPaymentOptions,
    ): void {
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const { apmFieldsContainer, apmFieldsStyles } = paypalOptions;

        if (!apmFieldsContainer) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercealternativemethods" argument should contain "apmFieldsContainer".',
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

        // @ts-ignore
        const paypalPaymentFields = paypalSdk.PaymentFields(fieldsOptions);

        paypalPaymentFields.render(apmFieldsContainer);
    }

    // private handleClick(methodId: string, gatewayId: string, paypalcommercealternativemethodratepay: any, actions: any) { // TODO: FIX
    //     console.log('HANDLE CLICK', methodId, gatewayId, paypalcommercealternativemethodratepay, actions);
    //     return Promise.resolve(); // TODO: REMOVE
    // }
    //
    // private handleApprove(data: any, submitForm: any) { // TODO: FIX
    //     console.log('HANDLE APPROVE', data, submitForm);
    // }

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
