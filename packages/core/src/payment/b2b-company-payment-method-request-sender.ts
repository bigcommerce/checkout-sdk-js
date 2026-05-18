import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

export interface B2BCompanyPaymentMethodsResponseBody {
    data: Array<{
        code: string;
        name: string;
        isEnabled: '1' | '0';
        paymentId: number;
    }>;
}

export default class B2BCompanyPaymentMethodRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async getB2BCompanyPaymentMethods(
        companyId: number,
        b2bToken: string,
        b2bBaseUrl: string,
        options?: RequestOptions,
    ): Promise<Response<B2BCompanyPaymentMethodsResponseBody>> {
        return this._requestSender.get<B2BCompanyPaymentMethodsResponseBody>(
            `${b2bBaseUrl}/api/v2/companies/${companyId}/payments`,
            {
                timeout: options?.timeout,
                credentials: false,
                headers: {
                    authToken: b2bToken,
                    Authorization: `Bearer ${b2bToken}`,
                },
            },
        );
    }
}
