import { createScriptLoader } from '@bigcommerce/script-loader';

import { MissingDataError, NotInitializedError, StandardError } from '../../../common/error/errors';

import { getCardinalBinProcessResponse, getCardinalOrderData, getCardinalSDK, getCardinalThreeDSResult, getCardinalValidatedData } from './cardinal.mock';
import { CardinalClient, CardinalEventType, CardinalInitializationType, CardinalPaymentType, CardinalScriptLoader, CardinalSignatureVerification, CardinalSDK, CardinalTriggerEvents, CardinalValidatedAction, CardinalValidatedData } from './index';

describe('CardinalClient', () => {
    let client: CardinalClient;
    let cardinalScriptLoader: CardinalScriptLoader;
    let sdk: CardinalSDK;
    let setupCall: () => {};
    let validatedCall: (data: CardinalValidatedData, jwt: string) => {};

    beforeEach(() => {
        cardinalScriptLoader = new CardinalScriptLoader(createScriptLoader());
        sdk = getCardinalSDK();
        client = new CardinalClient(cardinalScriptLoader);

        jest.spyOn(cardinalScriptLoader, 'load').mockReturnValue(Promise.resolve(sdk));
    });

    describe('#initialize', () => {
        it('loads the cardinal sdk correctly', async () => {
            await client.initialize('provider', false);

            expect(cardinalScriptLoader.load).toHaveBeenCalled();
        });
    });

    describe('#configure', () => {
        it('throws an error if test mode is not defined', async () => {
            try {
                await client.configure('token');
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('completes the setup process successfully', async () => {
            let call: () => {};

            sdk.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.SetupCompleted) {
                    call = callback;
                } else {
                    jest.fn();
                }
            });

            jest.spyOn(sdk, 'setup').mockImplementation(() => {
                call();
            });

            await client.initialize('provider', true);
            await client.configure('token');

            expect(sdk.on).toHaveBeenCalledWith(CardinalEventType.SetupCompleted, expect.any(Function));
            expect(sdk.setup).toHaveBeenCalledWith(CardinalInitializationType.Init, { jwt: 'token' });
        });

        it('completes the setup process with error', async () => {
            let call: (data: CardinalValidatedData, jwt: string) => {};

            sdk.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.Validated) {
                    call = callback;
                } else {
                    jest.fn();
                }
            });

            jest.spyOn(sdk, 'setup').mockImplementation(() => {
                call(getCardinalValidatedData(CardinalValidatedAction.Error, false, 1020), '');
            });

            await client.initialize('provider', true);

            try {
                await client.configure('token');
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#runBinProcess', () => {
        beforeEach(async () => {
            sdk.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.SetupCompleted) {
                    setupCall = callback;
                }
            });

            jest.spyOn(sdk, 'setup').mockImplementation(() => {
                setupCall();
            });

            await client.initialize('provider', true);
            await client.configure('token');
        });

        it('collects the data correctly', async () => {
            jest.spyOn(sdk, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProcessResponse(true)));

            await client.runBinProcess('123456');

            expect(sdk.trigger).toHaveBeenCalledWith(CardinalTriggerEvents.BinProcess, '123456');
        });

        it('throws an error if data was not collected correctly', async () => {
            jest.spyOn(sdk, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProcessResponse(false)));

            try {
                await client.runBinProcess('');
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('throws an error if cardinal throws an exception', async () => {
            jest.spyOn(sdk, 'trigger').mockImplementation(() => {
                return Promise.reject(new Error('Error'));
            });

            try {
                await client.runBinProcess('');
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
    });

    describe('#getThreeDSecureData', () => {
        beforeEach(async () => {
            sdk.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.SetupCompleted) {
                    setupCall = callback;
                } else {
                    validatedCall = callback;
                }
            });

            jest.spyOn(sdk, 'setup').mockImplementation(() => {
                setupCall();
            });

            await client.initialize('provider', true);
            await client.configure('token');
        });

        it('returns a valid token', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(getCardinalValidatedData(CardinalValidatedAction.Success, true), 'token');
            });

            const promise = await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());

            expect(sdk.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
            expect(promise).toEqual({ token: 'token' });
        });

        it('returns a no action code', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(getCardinalValidatedData(CardinalValidatedAction.NoAction, false, 0), 'token');
            });

            const promise = await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());

            expect(sdk.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
            expect(promise).toEqual({ token: 'token' });
        });

        it('returns an error and a no action code', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(getCardinalValidatedData(CardinalValidatedAction.NoAction, false, 3002), 'token');
            });

            try {
                await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
            }
        });

        it('returns a signature validation error and a no action code', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                const data = {
                    ...getCardinalValidatedData(CardinalValidatedAction.NoAction, false, 0),
                    Payment: {
                        ExtendedData: {
                            SignatureVerification: CardinalSignatureVerification.No,
                        },
                        ProcessorTransactionId: '',
                        Type: CardinalPaymentType.CCA,
                    },
                };

                validatedCall(data, 'token');
            });

            try {
                await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
            }
        });

        it('returns an error code', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(getCardinalValidatedData(CardinalValidatedAction.Error, false, 3004), 'token');
            });

            try {
                await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
            }
        });

        it('returns a failure code', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(getCardinalValidatedData(CardinalValidatedAction.Failure, false, 3004), 'token');
            });

            try {
                await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
                expect(error.message).toBe('User failed authentication or an error was encountered while processing the transaction.');
            }
        });

        it('does not return an action code', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                const data = {
                    ErrorDescription: '',
                    ErrorNumber: 0,
                    Validated: true,
                    Payment: {
                        ProcessorTransactionId: '',
                        Type: CardinalPaymentType.CCA,
                        ExtendedData: {},
                    },
                };
                validatedCall(data, 'token');
            });

            const promise = await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());

            expect(sdk.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
            expect(promise).toEqual({ token: 'token' });
        });

        it('returns an error without an action code', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                const data = {
                    ErrorDescription: 'Custom error',
                    ErrorNumber: 1533,
                    Validated: true,
                    Payment: {
                        ProcessorTransactionId: '',
                        Type: CardinalPaymentType.CCA,
                        ExtendedData: {},
                    },
                };
                validatedCall(data, 'token');
            });

            const promise = await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());

            expect(sdk.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
            expect(promise).toEqual({ token: 'token' });
        });

        it('returns a response without a jwt', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(getCardinalValidatedData(CardinalValidatedAction.Error, false, 100), '');
            });

            try {
                await client.getThreeDSecureData(getCardinalThreeDSResult(), getCardinalOrderData());
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
                expect(error.message).toBe('An error was encountered while processing the transaction.');
            }
        });
    });
});
