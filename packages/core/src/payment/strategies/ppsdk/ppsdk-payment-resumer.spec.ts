import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getErrorResponse } from '../../../common/http-request/responses.mock';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';

import { PaymentResumer } from './ppsdk-payment-resumer';
import { createStepHandler } from './step-handler';

describe('PaymentResumer', () => {
    const requestSender = createRequestSender();
    const stepHandler = createStepHandler(
        new FormPoster(),
        new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
    );
    const paymentResumer = new PaymentResumer(requestSender, stepHandler);

    describe('#resume', () => {
        it('throws a OrderFinalizationNotRequiredError error if the payment token endpoint returns a 404', async () => {
            jest.spyOn(requestSender, 'get').mockRejectedValue(
                getErrorResponse(undefined, undefined, 404),
            );

            await expect(
                paymentResumer.resume({
                    paymentId: 'some-id',
                    bigpayBaseUrl: 'https://some-domain.com',
                    orderId: 12345,
                }),
            ).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });

        it('requests the payment entity from the BigPay Payments endpoint', async () => {
            const requestSenderSpy = jest
                .spyOn(requestSender, 'get')
                .mockResolvedValueOnce({ body: { auth_token: 'some-token' } })
                .mockResolvedValueOnce({});

            jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await paymentResumer.resume({
                paymentId: 'some-id',
                bigpayBaseUrl: 'https://some-domain.com',
                orderId: 12345,
            });

            expect(requestSenderSpy).toHaveBeenCalledWith(
                'https://some-domain.com/payments/some-id',
                {
                    credentials: false,
                    headers: {
                        authorization: 'some-token',
                        'X-XSRF-TOKEN': null,
                    },
                },
            );
        });

        it('passes the Payments endpoint response to the stepHandler', async () => {
            jest.spyOn(requestSender, 'get')
                .mockResolvedValueOnce({ body: { auth_token: 'some-token' } })
                .mockResolvedValueOnce({ body: 'some-api-response' });

            const stepHandlerSpy = jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await paymentResumer.resume({
                paymentId: 'some-id',
                bigpayBaseUrl: 'https://some-domain.com',
                orderId: 12345,
            });

            expect(stepHandlerSpy).toHaveBeenCalledWith({ body: 'some-api-response' });
        });

        it('returns the final value from the stepHandler', async () => {
            jest.spyOn(requestSender, 'get')
                .mockResolvedValueOnce({ body: { auth_token: 'some-token' } })
                .mockResolvedValueOnce({});
            jest.spyOn(stepHandler, 'handle').mockResolvedValue({ someValue: 12345 });

            await expect(
                paymentResumer.resume({
                    paymentId: 'some-id',
                    bigpayBaseUrl: 'https://some-domain.com',
                    orderId: 12345,
                }),
            ).resolves.toStrictEqual({ someValue: 12345 });
        });
    });
});
