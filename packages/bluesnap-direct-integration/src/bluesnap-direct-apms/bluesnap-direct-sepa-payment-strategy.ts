import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import assertSepaInstrument from '../utils/is-bluesnap-direct-sepa-instrument';

export default class BlueSnapDirectSepaPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    async execute({ payment }: OrderRequestBody): Promise<void> {
        assertSepaInstrument(payment?.paymentData);

        await this._paymentIntegrationService.submitOrder();
        await this._paymentIntegrationService.submitPayment({
            ...payment,
            paymentData: {
                formattedPayload: {
                    sepa_direct_debit: {
                        iban: payment.paymentData.iban,
                        first_name: payment.paymentData.firstName,
                        last_name: payment.paymentData.lastName,
                        shopper_permission: payment.paymentData.shopperPermission,
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
