import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    NotInitializedError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getConfig } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeScriptLoader from './braintree-script-loader';
import BraintreeSdk from './braintree-sdk';
import {
    getClientMock,
    getDataCollectorMock,
    getModuleCreatorMock,
    getUsBankAccountMock,
} from './mocks';
import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeErrorCode,
    BraintreeModuleCreator,
    BraintreeUsBankAccount,
    BraintreeWindow,
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

    const clientTokenMock = 'clientTokenMock';
    const storeConfig: StoreConfig = getConfig().storeConfig;

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
        usBankAccountMock = getUsBankAccountMock();
        usBankAccountCreatorMock = getModuleCreatorMock(usBankAccountMock);

        braintreeSdk = new BraintreeSdk(braintreeScriptLoader);

        jest.spyOn(braintreeScriptLoader, 'initialize').mockImplementation(jest.fn);
        jest.spyOn(braintreeScriptLoader, 'loadClient').mockImplementation(() => clientCreatorMock);
        jest.spyOn(braintreeScriptLoader, 'loadDataCollector').mockImplementation(
            () => dataCollectorCreatorMock,
        );
        jest.spyOn(braintreeScriptLoader, 'loadUsBankAccount').mockImplementation(
            () => usBankAccountCreatorMock,
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    describe('#initialize()', () => {
        it('initializes braintree script loader', () => {
            braintreeSdk.initialize(clientTokenMock, storeConfig);

            expect(braintreeScriptLoader.initialize).toHaveBeenCalledWith(storeConfig);
        });
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
            braintreeSdk.initialize(clientTokenMock, storeConfig);

            await braintreeSdk.getClient();

            expect(braintreeScriptLoader.loadClient).toHaveBeenCalled();
            expect(clientCreatorMock.create).toHaveBeenCalledWith({
                authorization: clientTokenMock,
            });
        });

        it('returns the same client module while calling method for second time', async () => {
            braintreeSdk.initialize(clientTokenMock, storeConfig);

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

            braintreeSdk.initialize(clientTokenMock, storeConfig);

            await braintreeSdk.getDataCollectorOrThrow({ riskCorrelationId });

            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalled();
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
                kount: true,
                riskCorrelationId,
            });
        });

        it('returns the same data collector on second method call', async () => {
            braintreeSdk.initialize(clientTokenMock, storeConfig);

            await braintreeSdk.getDataCollectorOrThrow();
            await braintreeSdk.getDataCollectorOrThrow();

            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalledTimes(1);
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledTimes(1);
        });

        it('returns empty data collector when braintree throws Kount error', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockImplementation(() => {
                return Promise.reject({ code: BraintreeErrorCode.KountNotEnabled });
            });

            braintreeSdk.initialize(clientTokenMock, storeConfig);

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

            braintreeSdk.initialize(clientTokenMock, storeConfig);

            try {
                await braintreeSdk.getDataCollectorOrThrow();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(Error);
            }
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
            braintreeSdk.initialize(clientTokenMock, storeConfig);

            await braintreeSdk.getUsBankAccount();

            expect(braintreeScriptLoader.loadUsBankAccount).toHaveBeenCalled();
            expect(usBankAccountCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
            });
        });

        it('returns the same us bank account module while calling method for second time', async () => {
            braintreeSdk.initialize(clientTokenMock, storeConfig);

            await braintreeSdk.getUsBankAccount();
            await braintreeSdk.getUsBankAccount();

            expect(braintreeScriptLoader.loadUsBankAccount).toHaveBeenCalledTimes(1);
            expect(usBankAccountCreatorMock.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#deinitialize()', () => {
        it('teardowns data collector on deinitialize', async () => {
            braintreeSdk.initialize(clientTokenMock, storeConfig);

            const dataCollector = await braintreeSdk.getDataCollectorOrThrow();

            await braintreeSdk.deinitialize();

            expect(dataCollector.teardown).toHaveBeenCalled();
        });
    });
});
