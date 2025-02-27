import { Response } from '@bigcommerce/request-sender';

import { HeadlessPaymentMethodResponse } from './headless-payment';
import PaymentMethod from './payment-method';

export default function paymentMethodTransformer(
    response: Response<HeadlessPaymentMethodResponse>,
    methodId: string,
): Response<PaymentMethod> {
    const {
        body: {
            data: {
                site: {
                    paymentWalletWithInitializationData: { clientToken, initializationData },
                },
            },
        },
    } = response;

    return {
        ...response,
        body: {
            initializationData: initializationData ? JSON.parse(atob(initializationData)) : null,
            clientToken,
            id: methodId,
            config: {},
            method: '',
            supportedCards: [],
            type: 'PAYMENT_TYPE_API',
        },
    };
}
