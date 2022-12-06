import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../../spam-protection';
import { createStepHandler } from '../step-handler';

import { NoneSubStrategy } from './none-sub-strategy';

describe('NoneSubStrategy', () => {
    const requestSender = createRequestSender();
    const stepHandler = createStepHandler(
        new FormPoster(),
        new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
    );
    const noneSubStrategy = new NoneSubStrategy(requestSender, stepHandler);

    describe('#execute', () => {
        it('posts the Payment Method ID to the BigPay Payments endpoint', async () => {
            const requestSenderSpy = jest.spyOn(requestSender, 'post').mockResolvedValue({});

            jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await noneSubStrategy.execute({
                methodId: 'some-id.some-method',
                bigpayBaseUrl: 'https://some-domain.com',
                token: 'some-token',
            });

            expect(requestSenderSpy).toHaveBeenCalledWith('https://some-domain.com/payments', {
                body: { payment_method_id: 'some-id.some-method' },
                credentials: false,
                headers: {
                    authorization: 'some-token',
                    'X-XSRF-TOKEN': null,
                },
            });
        });

        it('passes the Payments endpoint response to the stepHandler', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({ body: 'some-api-response' });

            const stepHandlerSpy = jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await noneSubStrategy.execute({
                methodId: 'some-id.some-method',
                bigpayBaseUrl: 'https://some-domain.com',
                token: 'some-token',
            });

            expect(stepHandlerSpy).toHaveBeenCalledWith({ body: 'some-api-response' });
        });

        it('returns the final value from the stepHandler', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({});
            jest.spyOn(stepHandler, 'handle').mockResolvedValue({ someValue: 12345 });

            await expect(
                noneSubStrategy.execute({
                    methodId: 'some-id.some-method',
                    bigpayBaseUrl: 'https://some-domain.com',
                    token: 'some-token',
                }),
            ).resolves.toStrictEqual({ someValue: 12345 });
        });
    });
});
