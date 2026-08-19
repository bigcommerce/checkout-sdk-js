import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    NotInitializedError,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    getCardinalBinProcessResponse,
    getCardinalOrderData,
    getCardinalSDK,
    getCardinalThreeDSResult,
    getCardinalValidatedData,
} from './cardinal.mock';

import {
    CardinalClientV2,
    CardinalEventType,
    CardinalInitializationType,
    CardinalPaymentType,
    CardinalScriptLoaderV2,
    CardinalSDK,
    CardinalSignatureVerification,
    CardinalTriggerEvents,
    CardinalValidatedAction,
    setupCompleteFn,
    validatedFn,
} from './index';

const isSetupCompletedType = (
    type: CardinalEventType,
    callback: setupCompleteFn | validatedFn,
): callback is setupCompleteFn => {
    if (typeof callback === 'function' && type.toString() === CardinalEventType.SetupCompleted) {
        return true;
    }

    return false;
};

const isValidatedType = (
    type: CardinalEventType,
    callback: setupCompleteFn | validatedFn,
): callback is validatedFn => {
    if (typeof callback === 'function' && type.toString() === CardinalEventType.Validated) {
        return true;
    }

    return false;
};

describe('CardinalClientV2', () => {
    let client: CardinalClientV2;
    let cardinalScriptLoader: CardinalScriptLoaderV2;
    let sdk: CardinalSDK;
    let setupCall: setupCompleteFn;
    let validatedCall: validatedFn;

    beforeEach(() => {
        cardinalScriptLoader = new CardinalScriptLoaderV2(createScriptLoader());
        sdk = getCardinalSDK();
        client = new CardinalClientV2(cardinalScriptLoader);

        jest.spyOn(cardinalScriptLoader, 'load').mockReturnValue(Promise.resolve(sdk));
    });

    describe('#initialize', () => {
        it('loads the cardinal sdk with the experiment flag', async () => {
            await client.load('provider', true, true);

            expect(cardinalScriptLoader.load).toHaveBeenCalledWith('provider', true, true);
        });

        it('loads the cardinal sdk with the experiment disabled by default', async () => {
            await client.load('provider', true);

            expect(cardinalScriptLoader.load).toHaveBeenCalledWith('provider', true, false);
        });
    });

    describe('#configure', () => {
        let completed: setupCompleteFn;
        let validated: validatedFn;

        beforeEach(() => {
            sdk.on = jest.fn((type: CardinalEventType, callback) => {
                if (isSetupCompletedType(type, callback)) {
                    completed = callback;
                }

                if (isValidatedType(type, callback)) {
                    validated = callback;
                }
            });
        });

        describe('#successfully', () => {
            beforeEach(async () => {
                jest.spyOn(sdk, 'setup').mockImplementation(() => {
                    completed({ sessionId: '12', modules: [{ loaded: true, module: '123' }] });
                });

                await client.load('provider', true, true);
            });

            it('completes the setup process', async () => {
                await client.configure('token');

                expect(sdk.on).toHaveBeenCalledWith(
                    CardinalEventType.SetupCompleted,
                    expect.any(Function),
                );
                expect(sdk.setup).toHaveBeenCalledWith(CardinalInitializationType.Init, {
                    jwt: 'token',
                });
            });

            it('reconfigures the cardinal sdk keeping the experiment flag', async () => {
                await client.configure('firstToken');
                await client.configure('secondToken');

                expect(cardinalScriptLoader.load).toHaveBeenNthCalledWith(
                    2,
                    expect.stringMatching(/^provider/),
                    true,
                    true,
                );
                expect(sdk.on).toHaveBeenCalledTimes(4);
                expect(sdk.setup).toHaveBeenCalledTimes(2);
            });

            it("does not reconfigure the cardinal sdk if it's the same token", async () => {
                await client.configure('sameToken');
                await client.configure('sameToken');

                expect(cardinalScriptLoader.load).toHaveBeenNthCalledWith(
                    1,
                    'provider',
                    true,
                    true,
                );
                expect(sdk.on).toHaveBeenCalledTimes(2);
                expect(sdk.setup).toHaveBeenCalledTimes(1);
            });
        });

        it('throws an error if cardinal sdk is not defined', () => {
            expect(() => client.configure('token')).toThrow(NotInitializedError);

            expect(cardinalScriptLoader.load).not.toHaveBeenCalled();
            expect(sdk.on).not.toHaveBeenCalled();
            expect(sdk.setup).not.toHaveBeenCalled();
        });

        it('completes the setup process with error', async () => {
            jest.spyOn(sdk, 'setup').mockImplementation(() => {
                validated(getCardinalValidatedData(CardinalValidatedAction.Error, false, 1020), '');
            });

            await client.load('provider', true, true);

            await expect(client.configure('token')).rejects.toThrow(MissingDataError);
        });
    });

    describe('#runBinProcess', () => {
        beforeEach(async () => {
            sdk.on = jest.fn((type, callback) => {
                if (isSetupCompletedType(type, callback)) {
                    setupCall = callback;
                }
            });

            jest.spyOn(sdk, 'setup').mockImplementation(() => {
                setupCall({ sessionId: '12', modules: [{ loaded: true, module: '123' }] });
            });

            await client.load('provider', true, true);
            await client.configure('token');
        });

        it('collects the data correctly', async () => {
            jest.spyOn(sdk, 'trigger').mockReturnValue(
                Promise.resolve(getCardinalBinProcessResponse(true)),
            );

            await client.runBinProcess('123456');

            expect(sdk.trigger).toHaveBeenCalledWith(CardinalTriggerEvents.BinProcess, '123456');
        });

        it('throws an error if data was not collected correctly', async () => {
            jest.spyOn(sdk, 'trigger').mockReturnValue(
                Promise.resolve(getCardinalBinProcessResponse(false)),
            );

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
                if (isSetupCompletedType(type, callback)) {
                    setupCall = callback;
                } else {
                    validatedCall = callback;
                }
            });

            jest.spyOn(sdk, 'setup').mockImplementation(() => {
                setupCall({ sessionId: '12', modules: [{ loaded: true, module: '123' }] });
            });

            await client.load('provider', true, true);
            await client.configure('token');
        });

        it('returns a valid token', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(
                    getCardinalValidatedData(CardinalValidatedAction.Success, true),
                    'token',
                );
            });

            const promise = await client.getThreeDSecureData(
                getCardinalThreeDSResult(),
                getCardinalOrderData(),
            );

            expect(sdk.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
            expect(promise).toEqual({ token: 'token' });
        });

        it('returns a failure code', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(
                    getCardinalValidatedData(CardinalValidatedAction.Failure, false, 3004),
                    'token',
                );
            });

            try {
                await client.getThreeDSecureData(
                    getCardinalThreeDSResult(),
                    getCardinalOrderData(),
                );
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);

                if (error instanceof PaymentMethodFailedError) {
                    expect(error.message).toBe(
                        'User failed authentication or an error was encountered while processing the transaction.',
                    );
                }
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
                await client.getThreeDSecureData(
                    getCardinalThreeDSResult(),
                    getCardinalOrderData(),
                );
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });

        it('returns a response without a jwt', async () => {
            jest.spyOn(sdk, 'continue').mockImplementation(() => {
                validatedCall(
                    getCardinalValidatedData(CardinalValidatedAction.Error, false, 100),
                    '',
                );
            });

            try {
                await client.getThreeDSecureData(
                    getCardinalThreeDSResult(),
                    getCardinalOrderData(),
                );
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);

                if (error instanceof PaymentMethodFailedError) {
                    expect(error.message).toBe(
                        'An error was encountered while processing the transaction.',
                    );
                }
            }
        });
    });
});
