import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getResponse } from '../common/http-request/responses.mock';

import B2BCompanyPaymentMethodRequestSender, {
    B2BCompanyPaymentMethodsResponseBody,
} from './b2b-company-payment-method-request-sender';

describe('B2BCompanyPaymentMethodRequestSender', () => {
    let requestSender: RequestSender;
    let b2bCompanyPaymentMethodRequestSender: B2BCompanyPaymentMethodRequestSender;

    const responseBody: B2BCompanyPaymentMethodsResponseBody = {
        data: [
            { code: 'cheque', name: 'Check', isEnabled: '1', paymentId: 1 },
            { code: 'stripev3', name: 'Stripe', isEnabled: '1', paymentId: 2 },
        ],
    };

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'get').mockResolvedValue(getResponse(responseBody));

        b2bCompanyPaymentMethodRequestSender = new B2BCompanyPaymentMethodRequestSender(
            requestSender,
        );
    });

    describe('#getB2BCompanyPaymentMethods()', () => {
        it('calls the company payments endpoint with auth headers', async () => {
            await b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                42,
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
            );

            expect(requestSender.get).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/companies/42/payments',
                {
                    timeout: undefined,
                    credentials: false,
                    headers: {
                        authToken: 'b2b-token-value',
                        Authorization: 'Bearer b2b-token-value',
                    },
                },
            );
        });

        it('forwards the request timeout', async () => {
            const timeout = createTimeout();

            await b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                42,
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
                { timeout },
            );

            expect(requestSender.get).toHaveBeenCalledWith(
                'https://api-b2b.bigcommerce.com/api/v2/companies/42/payments',
                expect.objectContaining({ timeout }),
            );
        });

        it('uses the provided b2bBaseUrl for the endpoint', async () => {
            await b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                7,
                'b2b-token-value',
                'https://api-b2b.staging.zone',
            );

            expect(requestSender.get).toHaveBeenCalledWith(
                'https://api-b2b.staging.zone/api/v2/companies/7/payments',
                expect.any(Object),
            );
        });

        it('returns the response from the request sender', async () => {
            const result = await b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                42,
                'b2b-token-value',
                'https://api-b2b.bigcommerce.com',
            );

            expect(result.body).toEqual(responseBody);
        });
    });
});
