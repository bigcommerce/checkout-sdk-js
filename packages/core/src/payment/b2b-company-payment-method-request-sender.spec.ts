import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getResponse } from '../common/http-request/responses.mock';

import B2BCompanyPaymentMethodRequestSender, {
    B2BCompanyPaymentMethodsResponseBody,
} from './b2b-company-payment-method-request-sender';

describe('B2BCompanyPaymentMethodRequestSender', () => {
    let requestSender: RequestSender;
    let b2bCompanyPaymentMethodRequestSender: B2BCompanyPaymentMethodRequestSender;

    const b2bToken = 'b2b-token-value';
    const b2bBaseUrl = 'https://api-b2b.bigcommerce.com';
    const companyId = 42;
    const responseBody: B2BCompanyPaymentMethodsResponseBody = {
        data: [{ code: 'cheque', name: 'Cheque', isEnabled: '1', paymentId: 1 }],
    };

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'get').mockResolvedValue(getResponse(responseBody));

        b2bCompanyPaymentMethodRequestSender = new B2BCompanyPaymentMethodRequestSender(
            requestSender,
        );
    });

    describe('#getB2BCompanyPaymentMethods()', () => {
        it('issues a GET to the company payments endpoint with auth headers', async () => {
            await b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                companyId,
                b2bToken,
                b2bBaseUrl,
            );

            expect(requestSender.get).toHaveBeenCalledWith(
                `${b2bBaseUrl}/api/v2/companies/${companyId}/payments`,
                {
                    timeout: undefined,
                    credentials: false,
                    headers: {
                        authToken: b2bToken,
                        Authorization: `Bearer ${b2bToken}`,
                    },
                },
            );
        });

        it('forwards the timeout option to the underlying request', async () => {
            const timeout = createTimeout();

            await b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                companyId,
                b2bToken,
                b2bBaseUrl,
                { timeout },
            );

            expect(requestSender.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ timeout }),
            );
        });
    });
});
