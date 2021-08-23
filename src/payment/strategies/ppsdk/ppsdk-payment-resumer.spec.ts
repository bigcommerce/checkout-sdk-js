import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { PaymentResumer } from './ppsdk-payment-resumer';
import { StepHandler } from './step-handler';
import { ContinueHandler } from './step-handler/continue-handler';

describe('PaymentResumer', () => {
    const requestSender = createRequestSender();
    const stepHandler = new StepHandler(new ContinueHandler(new FormPoster()));
    const paymentResumer = new PaymentResumer(requestSender, stepHandler);

    describe('#resume', () => {
        it('requests the payment entity from the BigPay Payments endpoint', async () => {
            const requestSenderSpy = jest.spyOn(requestSender, 'get').mockResolvedValue({});
            jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await paymentResumer.resume({ paymentId: 'some-id', bigpayBaseUrl: 'https://some-domain.com', token: 'some-token' });

            expect(requestSenderSpy).toBeCalledWith(
                'https://some-domain.com/payments/some-id',
                {
                    credentials: false,
                    headers: {
                        authorization: 'some-token',
                        'X-XSRF-TOKEN': null,
                    },
                });
        });

        it('passes the Payments endpoint response to the stepHandler', async () => {
            jest.spyOn(requestSender, 'get').mockResolvedValue({ body: 'some-api-response' });
            const stepHandlerSpy = jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await paymentResumer.resume({ paymentId: 'some-id', bigpayBaseUrl: 'https://some-domain.com', token: 'some-token' });

            expect(stepHandlerSpy).toBeCalledWith({ body: 'some-api-response' });
        });

        it('returns the final value from the stepHandler', async () => {
            jest.spyOn(requestSender, 'get').mockResolvedValue({});
            jest.spyOn(stepHandler, 'handle').mockResolvedValue({ someValue: 12345 });

            await expect(paymentResumer.resume({ paymentId: 'some-id', bigpayBaseUrl: 'https://some-domain.com', token: 'some-token' }))
                .resolves.toStrictEqual({ someValue: 12345 });
        });
    });
});
