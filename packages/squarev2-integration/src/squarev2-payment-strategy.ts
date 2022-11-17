import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentStrategy,
} from "@bigcommerce/checkout-sdk/payment-integration-api";

import { WithSquareV2PaymentInitializeOptions } from "./squarev2-payment-initialize-options";
import SquareV2PaymentProcessor from "./squarev2-payment-processor";

export default class SquareV2PaymentStrategy implements PaymentStrategy {
    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _squareV2PaymentProcessor: SquareV2PaymentProcessor
    ) {}

    async initialize(
        options?: PaymentInitializeOptions &
            WithSquareV2PaymentInitializeOptions
    ): Promise<void> {
        if (!options?.squarev2?.containerId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "containerId" argument is not provided.'
            );
        }

        const { methodId, squarev2 } = options;
        const {
            config: { testMode },
            initializationData: { applicationId, locationId },
        } = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(methodId);

        await this._squareV2PaymentProcessor.initialize({
            applicationId,
            locationId,
            testMode,
        });
        await this._squareV2PaymentProcessor.initializeCard(squarev2);
    }

    async execute({ payment }: OrderRequestBody): Promise<void> {
        if (!payment) {
            throw new PaymentArgumentInvalidError(["payment"]);
        }

        let nonce = await this._squareV2PaymentProcessor.tokenize();

        if (this._shouldVerify()) {
            nonce = JSON.stringify({
                nonce,
                token: await this._squareV2PaymentProcessor.verifyBuyer(nonce),
            });
        }

        await this._paymentIntegrationService.submitOrder();
        await this._paymentIntegrationService.submitPayment({
            ...payment,
            paymentData: { nonce },
        });
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return this._squareV2PaymentProcessor.deinitialize();
    }

    private _shouldVerify(): boolean {
        const { features } = this._paymentIntegrationService
            .getState()
            .getStoreConfigOrThrow().checkoutSettings;

        return features["PROJECT-3828.add_3ds_support_on_squarev2"];
    }
}
