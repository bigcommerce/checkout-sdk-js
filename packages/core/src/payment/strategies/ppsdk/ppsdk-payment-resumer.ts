import { RequestSender } from '@bigcommerce/request-sender';

import { OrderFinalizationNotRequiredError } from '../../../order/errors';

import { PaymentsAPIResponse } from './ppsdk-payments-api-response';
import { StepHandler } from './step-handler';

interface ResumeSettings {
    orderId: number;
    paymentId: string;
    bigpayBaseUrl: string;
}

export class PaymentResumer {
    constructor(private _requestSender: RequestSender, private _stepHandler: StepHandler) {}

    async resume({ paymentId, bigpayBaseUrl, orderId }: ResumeSettings): Promise<void> {
        const token = await this._getToken(orderId).catch(() => {
            throw new OrderFinalizationNotRequiredError();
        });

        const options = {
            credentials: false,
            headers: {
                authorization: token,
                'X-XSRF-TOKEN': null,
            },
        };

        return this._requestSender
            .get<PaymentsAPIResponse['body']>(`${bigpayBaseUrl}/payments/${paymentId}`, options)
            .then((response) => this._stepHandler.handle(response));
    }

    private async _getToken(orderId: number): Promise<string> {
        const url = `/api/storefront/payments/auth-token`;
        const options = {
            params: {
                order_id: orderId,
            },
        };

        return this._requestSender
            .get<{ auth_token: string }>(url, options)
            .then(({ body }) => body.auth_token);
    }
}
