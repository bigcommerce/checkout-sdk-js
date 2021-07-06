import { createFormPoster } from '@bigcommerce/form-poster';

import { RequestError } from '../../../../common/error/errors';

import { ContinueHandler } from './continue-handler';
import { StepHandler } from './step-handler';

describe('StepHandler', () => {
    const formPoster = createFormPoster();
    const continueHandler = new ContinueHandler(formPoster);
    const handler = new StepHandler(continueHandler);

    describe('#handler', () => {
        describe('when passed an non 200 range response', () => {
            it('rejects with RequestError', async () => {
                const response = {
                    body: undefined,
                    status: 500,
                    statusText: '',
                    headers: [],
                };

                await expect(handler.handle(response)).rejects.toBeInstanceOf(RequestError);
            });
        });

        describe('when passed a 200 range response', () => {
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
                    const continueHandlerSpy = jest.spyOn(continueHandler, 'handle').mockImplementation(jest.fn);

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

                    expect(continueHandlerSpy).toHaveBeenCalledWith(body);
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

                    await expect(handler.handle(unsupportedResponse)).rejects.toBeInstanceOf(RequestError);
                });
            });
        });
    });
});
