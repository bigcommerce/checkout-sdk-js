import PaymentRequestSender from './payment-request-sender';
import { getErrorPaymentResponseBody, getPaymentRequestBody, getPaymentResponseBody } from './payments.mock';

describe('PaymentRequestSender', () => {
    let bigpayClient: any;
    let paymentRequestSender: PaymentRequestSender;

    describe('#submitPayment()', () => {
        beforeEach(() => {
            bigpayClient = {
                submitPayment: jest.fn((_, callback) => callback(null, {
                    data: getPaymentResponseBody(),
                    headers: { 'content-type': 'application/json' },
                    status: 200,
                    statusText: 'OK',
                })),
            };
            paymentRequestSender = new PaymentRequestSender(bigpayClient);
        });

        it('submits payment data to Bigpay', () => {
            const payload = getPaymentRequestBody();

            paymentRequestSender.submitPayment(payload);

            expect(bigpayClient.submitPayment).toHaveBeenCalledWith(payload, expect.any(Function));
        });

        it('returns payment response if submission is successful', async () => {
            const output = await paymentRequestSender.submitPayment(getPaymentRequestBody());

            expect(output).toEqual({
                body: getPaymentResponseBody(),
                headers: { 'content-type': 'application/json' },
                status: 200,
                statusText: 'OK',
            });
        });

        it('returns error response if submission is unsuccessful', async () => {
            bigpayClient.submitPayment = jest.fn((_, callback) => callback({
                data: getErrorPaymentResponseBody(),
                headers: { 'content-type': 'application/json' },
                status: 400,
                statusText: 'Bad Request',
            }));

            try {
                await paymentRequestSender.submitPayment(getPaymentRequestBody());
            } catch (error) {
                expect(error).toEqual({
                    body: getErrorPaymentResponseBody(),
                    headers: { 'content-type': 'application/json' },
                    status: 400,
                    statusText: 'Bad Request',
                });
            }
        });
    });

    describe('#initializeOffsitePayment()', () => {
        beforeEach(() => {
            bigpayClient = {
                initializeOffsitePayment: jest.fn(),
            };
            paymentRequestSender = new PaymentRequestSender(bigpayClient);
        });

        it('submits payment data to Bigpay', () => {
            const payload = getPaymentRequestBody();

            paymentRequestSender.initializeOffsitePayment(payload);

            expect(bigpayClient.initializeOffsitePayment).toHaveBeenCalledWith(payload);
        });
    });
});
