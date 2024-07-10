import { createFormPoster } from '@bigcommerce/form-poster';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { RequestError } from '../../../../common/error/errors';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../../spam-protection';

import { ContinueHandler } from './continue-handler';
import { StepHandler } from './step-handler';

describe('StepHandler', () => {
    const formPoster = createFormPoster();
    const continueHandler = new ContinueHandler(
        formPoster,
        new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
    );
    const handler = new StepHandler(continueHandler);

    describe('#handler', () => {
        describe('with a success body', () => {
            it('resolves to undefined', async () => {
                const successResponse = {
                    body: {
                        type: 'success',
                    },
                    status: 200,
                    statusText: '',
                    headers: [],
                };

                await expect(handler.handle(successResponse)).resolves.toBeUndefined();
            });
        });

        describe('with a continue body', () => {
            it('passes the body to the continueHandler', async () => {
                const continueHandlerSpy = jest
                    .spyOn(continueHandler, 'handle')
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    .mockImplementation(jest.fn);

                const body = {
                    type: 'continue',
                    code: 'redirect',
                    parameters: {
                        url: 'http://some-url.com',
                    },
                };

                const redirectContinueResponse = {
                    body,
                    status: 200,
                    statusText: '',
                    headers: [],
                };

                await handler.handle(redirectContinueResponse);

                expect(continueHandlerSpy).toHaveBeenCalledWith(body, undefined);
            });
        });

        describe('with a failed body', () => {
            it('rejects with RequestError', async () => {
                const failedResponse = {
                    body: {
                        type: 'failed',
                        code: 'any-failure',
                    },
                    status: 200,
                    statusText: '',
                    headers: [],
                };

                await expect(handler.handle(failedResponse)).rejects.toBeInstanceOf(RequestError);
            });
        });

        describe('with an error body', () => {
            it('rejects with RequestError', async () => {
                const errorResponse = {
                    body: {
                        type: 'error',
                    },
                    status: 200,
                    statusText: '',
                    headers: [],
                };

                await expect(handler.handle(errorResponse)).rejects.toBeInstanceOf(RequestError);
            });
        });

        describe('with an unsupported body', () => {
            it('rejects with RequestError', async () => {
                const unsupportedResponse = {
                    body: {
                        type: 'continue',
                        code: 'not-supported',
                    },
                    status: 200,
                    statusText: '',
                    headers: [],
                };

                await expect(handler.handle(unsupportedResponse)).rejects.toBeInstanceOf(
                    RequestError,
                );
            });
        });
    });
});
