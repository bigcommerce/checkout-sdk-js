import { createScriptLoader } from '@bigcommerce/script-loader';

import { NotInitializedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeScriptLoader from './braintree-script-loader';
import BraintreeSdk from './braintree-sdk';
import {
    getBraintreeLocalPaymentMock,
    getClientMock,
    getDataCollectorMock,
    getGooglePaymentMock,
    getModuleCreatorMock,
    getThreeDSecureMock,
    getUsBankAccountMock,
    getVenmoCheckoutMock,
    getVisaCheckoutMock,
    getVisaCheckoutSDKMock,
} from './mocks';
import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeError,
    BraintreeErrorCode,
    BraintreeErrorType,
    BraintreeGooglePayment,
    BraintreeGooglePaymentCreator,
    BraintreeLocalPayment,
    BraintreeLocalPaymentCreateConfig,
    BraintreeLocalPaymentCreator,
    BraintreeModuleCreator,
    BraintreeThreeDSecure,
    BraintreeThreeDSecureCreator,
    BraintreeUsBankAccount,
    BraintreeVenmoCheckout,
    BraintreeVisaCheckout,
    BraintreeVisaCheckoutCreator,
    BraintreeWindow,
    VisaCheckoutSDK,
} from './types';

describe('BraintreeSdk', () => {
    let braintreeSdk: BraintreeSdk;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeWindowMock: BraintreeWindow;
    let clientCreatorMock: BraintreeModuleCreator<BraintreeClient>;
    let clientMock: BraintreeClient;
    let dataCollectorCreatorMock: BraintreeModuleCreator<BraintreeDataCollector>;
    let dataCollectorMock: BraintreeDataCollector;
    let usBankAccountCreatorMock: BraintreeModuleCreator<BraintreeUsBankAccount>;
    let usBankAccountMock: BraintreeUsBankAccount;
    let braintreeVisaCheckoutMock: BraintreeVisaCheckout;
    let braintreeVisaCheckoutCreatorMock: BraintreeVisaCheckoutCreator;
    let threeDSMock: BraintreeThreeDSecure;
    let threeDSCreatorMock: BraintreeThreeDSecureCreator;
    let braintreeGooglePayment: BraintreeGooglePayment;
    let braintreeGooglePaymentCreator: BraintreeGooglePaymentCreator;
    let braintreeLocalPayment: BraintreeLocalPayment;
    let braintreeLocalPaymentCreator: BraintreeLocalPaymentCreator;
    let visaCheckoutSdkMock: VisaCheckoutSDK;

    const clientTokenMock = 'clientTokenMock';

    beforeEach(() => {
        braintreeWindowMock = window as BraintreeWindow;
        braintreeScriptLoader = new BraintreeScriptLoader(
            createScriptLoader(),
            braintreeWindowMock,
        );
        clientMock = getClientMock();
        clientCreatorMock = getModuleCreatorMock(clientMock);
        dataCollectorMock = getDataCollectorMock();
        dataCollectorCreatorMock = getModuleCreatorMock(dataCollectorMock);
        threeDSMock = getThreeDSecureMock();
        threeDSCreatorMock = getModuleCreatorMock(threeDSMock);
        usBankAccountMock = getUsBankAccountMock();
        usBankAccountCreatorMock = getModuleCreatorMock(usBankAccountMock);
        visaCheckoutSdkMock = getVisaCheckoutSDKMock();
        braintreeGooglePayment = getGooglePaymentMock();
        braintreeGooglePaymentCreator = getModuleCreatorMock(braintreeGooglePayment);
        braintreeLocalPayment = getBraintreeLocalPaymentMock();
        braintreeLocalPaymentCreator = getModuleCreatorMock(braintreeLocalPayment);

        braintreeSdk = new BraintreeSdk(braintreeScriptLoader);

        jest.spyOn(braintreeScriptLoader, 'loadClient').mockImplementation(() =>
            Promise.resolve(clientCreatorMock),
        );
        jest.spyOn(braintreeScriptLoader, 'loadDataCollector').mockImplementation(() =>
            Promise.resolve(dataCollectorCreatorMock),
        );
        jest.spyOn(braintreeScriptLoader, 'loadUsBankAccount').mockImplementation(() =>
            Promise.resolve(usBankAccountCreatorMock),
        );
        jest.spyOn(braintreeScriptLoader, 'loadVisaCheckout').mockImplementation(() =>
            Promise.resolve(braintreeVisaCheckoutCreatorMock),
        );
        jest.spyOn(braintreeScriptLoader, 'loadVisaCheckoutSdk').mockImplementation(() =>
            Promise.resolve(visaCheckoutSdkMock),
        );
        jest.spyOn(braintreeScriptLoader, 'load3DS').mockImplementation(() =>
            Promise.resolve(threeDSCreatorMock),
        );
        jest.spyOn(braintreeScriptLoader, 'loadGooglePayment').mockImplementation(() =>
            Promise.resolve(braintreeGooglePaymentCreator),
        );
        jest.spyOn(braintreeScriptLoader, 'loadLocalPayment').mockImplementation(() =>
            Promise.resolve(braintreeLocalPaymentCreator),
        );

        braintreeVisaCheckoutMock = getVisaCheckoutMock();
        braintreeVisaCheckoutCreatorMock = getModuleCreatorMock(braintreeVisaCheckoutMock);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    describe('#getClientToken()', () => {
        it('throws an error if client token was not provided', async () => {
            try {
                await braintreeSdk.getClient();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('creates braintree client module', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getClient();

            expect(braintreeScriptLoader.loadClient).toHaveBeenCalled();
            expect(clientCreatorMock.create).toHaveBeenCalledWith({
                authorization: clientTokenMock,
            });
        });

        it('returns the same client module while calling method for second time', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getClient();
            await braintreeSdk.getClient();

            expect(braintreeScriptLoader.loadClient).toHaveBeenCalledTimes(1);
            expect(clientCreatorMock.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getDataCollector()', () => {
        it('throws an error if client token was not provided', async () => {
            try {
                await braintreeSdk.getDataCollectorOrThrow();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('creates data collector with provided options', async () => {
            const riskCorrelationId = 'sessionId';

            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getDataCollectorOrThrow({ riskCorrelationId });

            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalled();
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
                kount: true,
                riskCorrelationId,
            });
        });

        it('returns the same data collector on second method call', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getDataCollectorOrThrow();
            await braintreeSdk.getDataCollectorOrThrow();

            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalledTimes(1);
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledTimes(1);
        });

        it('returns empty data collector when braintree throws Kount error', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockImplementation(() => {
                return Promise.reject({ code: BraintreeErrorCode.KountNotEnabled });
            });

            braintreeSdk.initialize(clientTokenMock);

            const result = await braintreeSdk.getDataCollectorOrThrow();

            expect(result).toEqual({
                deviceData: undefined,
                teardown: expect.any(Function),
            });
        });

        it('throws an error when unexpected error occurs', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockImplementation(() => {
                throw new Error();
            });

            braintreeSdk.initialize(clientTokenMock);

            try {
                await braintreeSdk.getDataCollectorOrThrow();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('#getBraintreeThreeDS()', () => {
        it('throws an error if client token is not defined', async () => {
            try {
                await braintreeSdk.getBraintreeThreeDS();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('creates Braintree 3D Secure module', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getBraintreeThreeDS();

            expect(braintreeScriptLoader.load3DS).toHaveBeenCalled();
            expect(threeDSCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
                version: 2,
            });
        });

        it('returns the same Braintree 3D Secure module while calling method for second time', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getBraintreeThreeDS();
            await braintreeSdk.getBraintreeThreeDS();

            expect(braintreeScriptLoader.load3DS).toHaveBeenCalledTimes(1);
            expect(threeDSCreatorMock.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getBraintreeGooglePayment()', () => {
        it('throws an error if client token is not defined', async () => {
            try {
                await braintreeSdk.getBraintreeGooglePayment();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('creates Braintree Google Payment module', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getBraintreeGooglePayment();

            expect(braintreeScriptLoader.loadGooglePayment).toHaveBeenCalled();
            expect(braintreeGooglePaymentCreator.create).toHaveBeenCalledWith({
                client: clientMock,
            });
        });

        it('returns the same Braintree Google Payment module while calling method for second time', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getBraintreeGooglePayment();
            await braintreeSdk.getBraintreeGooglePayment();

            expect(braintreeScriptLoader.loadGooglePayment).toHaveBeenCalledTimes(1);
            expect(braintreeGooglePaymentCreator.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getBraintreeLocalPayment()', () => {
        const merchantId = 'merchantAccountId';
        const getBraintreeLocalPaymentCreatorCreateMock = (
            callbackError: BraintreeError | undefined = undefined,
        ) => {
            return async (
                _: BraintreeLocalPaymentCreateConfig,
                callback?: (
                    error: BraintreeError | undefined,
                    instance: BraintreeLocalPayment,
                ) => void,
            ): Promise<BraintreeLocalPayment> => {
                if (callback && typeof callback === 'function') {
                    callback(callbackError, braintreeLocalPayment);
                }

                return Promise.resolve(braintreeLocalPayment);
            };
        };

        it('throws an error if client token is not defined', async () => {
            try {
                await braintreeSdk.getBraintreeLocalPayment(merchantId);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('creates Braintree Local Payment module', async () => {
            jest.spyOn(braintreeLocalPaymentCreator, 'create').mockImplementation(
                getBraintreeLocalPaymentCreatorCreateMock(),
            );

            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getBraintreeLocalPayment(merchantId);

            expect(braintreeScriptLoader.loadLocalPayment).toHaveBeenCalled();
            expect(braintreeLocalPaymentCreator.create).toHaveBeenCalledWith(
                {
                    client: clientMock,
                    merchantAccountId: merchantId,
                },
                expect.any(Function),
            );
        });

        it('throws an error if Braintree Local Payment module creation fails', async () => {
            const braintreeError: BraintreeError = {
                name: 'test',
                type: BraintreeErrorType.Network,
                code: 'NETWORK_ERROR',
                message: 'Network error',
            };

            jest.spyOn(braintreeLocalPaymentCreator, 'create').mockImplementation(
                getBraintreeLocalPaymentCreatorCreateMock(braintreeError),
            );

            braintreeSdk.initialize(clientTokenMock);

            try {
                await braintreeSdk.getBraintreeLocalPayment(merchantId);
            } catch (error: unknown) {
                expect(error).toEqual(braintreeError);
            }
        });

        it('returns the same Braintree Local Payment module while calling method for second time', async () => {
            jest.spyOn(braintreeLocalPaymentCreator, 'create').mockImplementation(
                getBraintreeLocalPaymentCreatorCreateMock(),
            );

            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getBraintreeLocalPayment(merchantId);
            await braintreeSdk.getBraintreeLocalPayment(merchantId);

            expect(braintreeScriptLoader.loadLocalPayment).toHaveBeenCalledTimes(1);
            expect(braintreeLocalPaymentCreator.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getUsBankAccount()', () => {
        it('throws an error if client token was not provided', async () => {
            try {
                await braintreeSdk.getUsBankAccount();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('creates braintree us bank account module', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getUsBankAccount();

            expect(braintreeScriptLoader.loadUsBankAccount).toHaveBeenCalled();
            expect(usBankAccountCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
            });
        });

        it('returns the same us bank account module while calling method for second time', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getUsBankAccount();
            await braintreeSdk.getUsBankAccount();

            expect(braintreeScriptLoader.loadUsBankAccount).toHaveBeenCalledTimes(1);
            expect(usBankAccountCreatorMock.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getVenmoCheckout()', () => {
        let braintreeVenmoCheckoutMock: BraintreeVenmoCheckout;
        let braintreeVenmoCheckoutCreatorMock: BraintreeModuleCreator<BraintreeVenmoCheckout>;

        beforeEach(() => {
            braintreeSdk.initialize(clientTokenMock);
            braintreeVenmoCheckoutMock = getVenmoCheckoutMock();
            braintreeVenmoCheckoutCreatorMock = getModuleCreatorMock(braintreeVenmoCheckoutMock);
            braintreeScriptLoader.loadVenmoCheckout = jest
                .fn()
                .mockReturnValue(Promise.resolve(braintreeVenmoCheckoutCreatorMock));
        });

        it('returns a promise that resolves to the BraintreeVenmoCheckout', async () => {
            const braintreeVenmoCreateMock = {
                create: jest.fn().mockReturnValue({
                    isBrowserSupported: jest.fn().mockReturnValue(true),
                    teardown: expect.any(Function),
                    tokenize: expect.any(Function),
                }),
            };

            jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(
                Promise.resolve(braintreeVenmoCreateMock),
            );

            await braintreeSdk.getVenmoCheckoutOrThrow();

            expect(braintreeVenmoCreateMock.create).toHaveBeenCalled();
        });

        it('always returns the same instance of the BraintreeVenmoCheckout client', async () => {
            const braintreeVenmoCreateMock = {
                create: jest.fn().mockReturnValue({
                    isBrowserSupported: jest.fn().mockReturnValue(true),
                    teardown: expect.any(Function),
                    tokenize: expect.any(Function),
                }),
            };

            jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                braintreeVenmoCreateMock,
            );

            const braintreeVenmoCheckout1 = await braintreeSdk.getVenmoCheckoutOrThrow();
            const braintreeVenmoCheckout2 = await braintreeSdk.getVenmoCheckoutOrThrow();

            expect(braintreeVenmoCheckout1).toBe(braintreeVenmoCheckout2);
            expect(braintreeScriptLoader.loadVenmoCheckout).toHaveBeenCalledTimes(1);
            expect(braintreeVenmoCreateMock.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getBraintreeVisaCheckout()', () => {
        it('throws an error if client token was not provided', async () => {
            try {
                await braintreeSdk.getBraintreeVisaCheckout();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('get braintree visa checkout', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getBraintreeVisaCheckout();

            expect(braintreeScriptLoader.loadVisaCheckout).toHaveBeenCalled();
            expect(braintreeScriptLoader.loadClient).toHaveBeenCalled();
            expect(braintreeVisaCheckoutCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
            });
        });

        it('returns the same visa checkout module while calling method for second time', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getBraintreeVisaCheckout();
            await braintreeSdk.getBraintreeVisaCheckout();

            expect(braintreeScriptLoader.loadVisaCheckout).toHaveBeenCalledTimes(1);
            expect(braintreeVisaCheckoutCreatorMock.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getVisaCheckoutSdk()', () => {
        it('get visa checkout sdk', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getVisaCheckoutSdk();

            expect(braintreeScriptLoader.loadVisaCheckoutSdk).toHaveBeenCalled();
        });

        it('returns the same visa checkout sdk module while calling method for second time', async () => {
            braintreeSdk.initialize(clientTokenMock);

            await braintreeSdk.getVisaCheckoutSdk();
            await braintreeSdk.getVisaCheckoutSdk();

            expect(braintreeScriptLoader.loadVisaCheckoutSdk).toHaveBeenCalledTimes(1);
        });
    });

    describe('#deinitialize()', () => {
        it('teardowns data collector on deinitialize', async () => {
            braintreeSdk.initialize(clientTokenMock);

            const dataCollector = await braintreeSdk.getDataCollectorOrThrow();

            await braintreeSdk.deinitialize();

            expect(dataCollector.teardown).toHaveBeenCalled();
        });
    });
});
