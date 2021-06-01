import { createRequestSender } from '@bigcommerce/request-sender';
import { isEqual } from 'lodash';

import { PPSDKPaymentMethod  } from '../../../ppsdk-payment-method';
import { PaymentProcessor } from '../ppsdk-payment-processor';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';
import { stepHandler } from '../step-handler';

interface None {
    type: 'NONE';
}

export const isNone = (unknownStrategy: unknown): unknownStrategy is None =>
    isEqual(unknownStrategy, { type: 'NONE' });

export const initializeNone = (paymentMethod: PPSDKPaymentMethod): PaymentProcessor => {
    const requestSender = createRequestSender();
    const paymentMethodId = `${paymentMethod.id}.${paymentMethod.method}`;
    const body = JSON.stringify({ payment_method_id: paymentMethodId });

    return () => requestSender.post<PaymentsAPIResponse>('/payments', { body })
        .then(stepHandler);
};
