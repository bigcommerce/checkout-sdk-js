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
            paypalcommercealternativemethodratepay
        } = options;

        console.log(
            options,this.paymentIntegrationService,
            this.paypalCommerceIntegrationService,
            this.handleError,
            this.toggleLoadingIndicator,
            gatewayId,
            methodId,
            paypalcommercealternativemethodratepay,
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

        if (!paypalcommercealternativemethodratepay) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercealternativemethodratepay" argument is not provided.`,
            );
        }

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        this.loadingIndicatorContainer = paypalcommercealternativemethodratepay.container.split('#')[1];

        this.renderButton(methodId, gatewayId, paypalcommercealternativemethodratepay);
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

    private renderButton(methodId: string, gatewayId: string, paypalcommercealternativemethodratepay: any) { // TODO: FIX
        console.log('RENDER BUTTON', methodId, gatewayId, paypalcommercealternativemethodratepay);
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const { container, onError, onRenderButton, submitForm } = paypalcommercealternativemethodratepay;

        // const buttonOptions: PayPalCommerceButtonsOptions = {
        //     fundingSource: methodId,
        //     style: {},
        //     createOrder: () => {
        //       return this.paypalCommerceIntegrationService.createOrder(  // TODO: FIX
        //             'paypalcommercealternativemethodscheckout',
        //         )
        //     },
        //     onClick: (_, actions) => this.handleClick(methodId, gatewayId, paypalcommercealternativemethodratepay, actions),
        //     onApprove: (data) => this.handleApprove(data, submitForm),
        //     // onCancel: () => this.resetPollingMechanism(),
        //     onError: (error) => this.handleError(error, onError),
        // };

        this.ratePayButton = paypalSdk.Legal({ fundingSource: paypalSdk.Legal.FUNDING.PAY_UPON_INVOICE });

        if (!this.ratePayButton.isEligible()) {
            return;
        }

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        this.ratePayButton.Legal.render(container);
    }

    private renderFields() {
        console.log('RENDER FIELDS');
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
