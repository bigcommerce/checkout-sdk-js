import {
    InvalidArgumentError, MissingDataError, MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    PaymentInitializeOptions, PaymentIntegrationService, PaymentMethod,
    PaymentStrategy
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import BraintreeIntegrationService from "../braintree-integration-service";
import {BraintreeInitializationData} from "../braintree";


export default class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {


    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}


    async initialize(
        options: PaymentInitializeOptions
    ): Promise<void> {
        console.log('INITIALIZE', options, this.paymentIntegrationService);
        const {
            gatewayId,
            methodId,
            braintreelocalmethods,
        } = options;


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


        if (!braintreelocalmethods) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreelocalmethods" argument is not provided.`,
            );
        }


        await this.paymentIntegrationService.loadPaymentMethod(methodId);


        const state = this.paymentIntegrationService.getState();
        const paymentMethod: PaymentMethod<BraintreeInitializationData> =
            state.getPaymentMethodOrThrow(methodId);


        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }


        await this.braintreeIntegrationService.loadBraintreeLocalMethods();
    }




    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }


    async deinitialize(): Promise<void> {


        return Promise.resolve();
    }


    async execute() {
        console.log('EXECUTE');
    }
}
