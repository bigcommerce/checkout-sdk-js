import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { isPPSDKPaymentMethod, PPSDKPaymentMethod } from 'packages/core/src/payment/ppsdk-payment-method';

type GetPPSDKMethod = (paymentIntegrationService: PaymentIntegrationService, methodId: string) => PPSDKPaymentMethod | undefined;

export const getPPSDKMethod: GetPPSDKMethod = (paymentIntegrationService, methodId) => {
    const paymentMethod = paymentIntegrationService.getState().getPaymentMethod(methodId);

    if (!paymentMethod || !isPPSDKPaymentMethod(paymentMethod)) {
        return;
    }

    return paymentMethod;
};
