import {
    AddressRequestBody,
    InvalidArgumentError,
    PaymentIntegrationService,
    ShippingInitializeOptions,
    ShippingRequestOptions,
    ShippingStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

// TODO: this strategy will be updated in one of the future PR
export default class BraintreeAcceleratedCheckoutShippingStrategy implements ShippingStrategy {
    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    initialize(options: ShippingInitializeOptions): Promise<void> {
        const { methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomer();

        console.log('paymentIntegrationService -> customer:', customer);
        console.log('BraintreeAcceleratedCheckoutShippingStrategy initialize options:', options);

        return Promise.resolve();
    }

    deinitialize(options?: ShippingRequestOptions): Promise<void> {
        console.log('BraintreeAcceleratedCheckoutShippingStrategy deinitialize options:', options);

        return Promise.resolve();
    }

    updateAddress(
        address: Partial<AddressRequestBody>,
        options?: ShippingRequestOptions,
    ): Promise<void> {
        console.log('BraintreeAcceleratedCheckoutShippingStrategy updateAddress data:', {
            address,
            options,
        });

        return Promise.resolve();
    }

    selectOption(optionId: string, options?: ShippingRequestOptions): Promise<void> {
        console.log('BraintreeAcceleratedCheckoutShippingStrategy selectOption data:', {
            optionId,
            options,
        });

        return Promise.resolve();
    }
}
