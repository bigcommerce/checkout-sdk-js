import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import assertBlueSnapDirectEcpInstrument from './is-bluesnap-direct-ecp-instrument';

export default class BlueSnapDirectEcpPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    async execute({ payment }: OrderRequestBody): Promise<void> {
        assertBlueSnapDirectEcpInstrument(payment?.paymentData);

        await this._paymentIntegrationService.submitOrder();
        await this._paymentIntegrationService.submitPayment({
            ...payment,
            paymentData: {
                formattedPayload: {
                    ecp: {
                        account_number: payment.paymentData.accountNumber,
                        account_type: payment.paymentData.accountType,
                        shopper_permission: payment.paymentData.shopperPermission,
                        routing_number: payment.paymentData.routingNumber,
                    },
                },
            },
        });
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }
}
