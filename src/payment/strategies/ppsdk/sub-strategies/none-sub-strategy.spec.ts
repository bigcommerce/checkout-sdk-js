import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { StepHandler } from '../step-handler';
import { ContinueHandler } from '../step-handler/continue-handler';

import { NoneSubStrategy } from './none-sub-strategy';

describe('NoneSubStrategy', () => {
    const requestSender = createRequestSender();
    const stepHandler = new StepHandler(new ContinueHandler(new FormPoster()));
    const noneSubStrategy = new NoneSubStrategy(requestSender, stepHandler);

    describe('#process', () => {
        it('posts the Payment Method ID to the BigPay Payments endpoint', async () => {
            const requestSenderSpy = jest.spyOn(requestSender, 'post').mockResolvedValue({});
            jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await noneSubStrategy.process({ methodId: 'some-id.some-method', bigpayBaseUrl: 'https://some-domain.com', token: 'some-token' });

            expect(requestSenderSpy).toBeCalledWith(
                'https://some-domain.com/payments',
                {
                    body: { payment_method_id: 'some-id.some-method' },
                    credentials: false,
                    headers: {
                        authorization: 'some-token',
                        'X-XSRF-TOKEN': null,
                    },
                }
            );
        });

        it('passes the Payments endpoint response to the stepHandler', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({ body: 'some-api-response' });
            const stepHandlerSpy = jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await noneSubStrategy.process({ methodId: 'some-id.some-method', bigpayBaseUrl: 'https://some-domain.com', token: 'some-token' });

            expect(stepHandlerSpy).toBeCalledWith({ body: 'some-api-response' });
        });

        it('returns the final value from the stepHandler', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({});
            jest.spyOn(stepHandler, 'handle').mockResolvedValue({ someValue: 12345 });

            await expect(noneSubStrategy.process({ methodId: 'some-id.some-method', bigpayBaseUrl: 'https://some-domain.com', token: 'some-token' }))
                .resolves.toStrictEqual({ someValue: 12345 });
        });
    });
});
