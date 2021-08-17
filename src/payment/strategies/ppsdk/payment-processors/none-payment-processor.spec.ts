import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { PaymentStrategyType } from '../../..';
import { PPSDKPaymentMethod } from '../../../ppsdk-payment-method';
import { StepHandler } from '../step-handler';
import { ContinueHandler } from '../step-handler/continue-handler';

import { NonePaymentProcessor } from './none-payment-processor';

describe('NonePaymentProcessor', () => {
    const paymentMethod: PPSDKPaymentMethod = {
        id: 'some-id',
        method: 'some-method',
        type: PaymentStrategyType.PPSDK,
        config: {},
        supportedCards: [],
        initializationStrategy: {
            type: 'some-strategy',
        },
    };

    const requestSender = createRequestSender();
    const stepHandler = new StepHandler(new ContinueHandler(new FormPoster()));
    const nonePaymentProcessor = new NonePaymentProcessor(requestSender, stepHandler);

    describe('#process', () => {
        it('posts the Payment Method ID to the BigPay Payments endpoint', async () => {
            const requestSenderSpy = jest.spyOn(requestSender, 'post').mockResolvedValue({});
            jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await nonePaymentProcessor.process({ paymentMethod, bigpayBaseUrl: 'https://some-domain.com' });

            expect(requestSenderSpy).toBeCalledWith(
                'https://some-domain.com/payments',
                {
                    body: { payment_method_id: 'some-id.some-method' },
                    credentials: false,
                }
            );
        });

        it('passes the Payments endpoint response to the stepHandler', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({ body: 'some-api-response' });
            const stepHandlerSpy = jest.spyOn(stepHandler, 'handle').mockResolvedValue({});

            await nonePaymentProcessor.process({ paymentMethod, bigpayBaseUrl: 'https://some-domain.com' });

            expect(stepHandlerSpy).toBeCalledWith({ body: 'some-api-response' });
        });

        it('returns the final value from the stepHandler', async () => {
            jest.spyOn(requestSender, 'post').mockResolvedValue({});
            jest.spyOn(stepHandler, 'handle').mockResolvedValue({ someValue: 12345 });

            await expect(nonePaymentProcessor.process({ paymentMethod, bigpayBaseUrl: 'https://some-domain.com' }))
                .resolves.toStrictEqual({ someValue: 12345 });
        });
    });
});
