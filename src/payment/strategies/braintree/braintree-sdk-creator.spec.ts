import { NotInitializedError } from '../../../common/error/errors';

import BraintreeScriptLoader from './braintree-script-loader';
import BraintreeSDKCreator from './braintree-sdk-creator';
import {
    getClientMock,
    getDataCollectorMock,
    getModuleCreatorMock,
    getThreeDSecureMock,
    getVisaCheckoutMock,
} from './braintree.mock';

describe('Braintree SDK Creator', () => {
    let braintreeScriptLoader: BraintreeScriptLoader;
    let clientMock;
    let clientCreatorMock;

    beforeEach(() => {
        clientMock = getClientMock();
        clientCreatorMock = getModuleCreatorMock(clientMock);
        braintreeScriptLoader = {} as BraintreeScriptLoader;
    });

    describe('#constructor()', () => {
        it('creates and instance of the sdk Creator', () => {
            const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            expect(braintreeSDKCreator).toBeInstanceOf(BraintreeSDKCreator);
        });
    });

    describe('#getClient()', () => {
        beforeEach(() => {
            braintreeScriptLoader.loadClient = jest.fn().mockReturnValue(Promise.resolve(clientCreatorMock));
        });

        it('uses the right arguments to create the client', async () => {
            const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            braintreeSDKCreator.initialize('clientToken');
            const client = await braintreeSDKCreator.getClient();
            expect(clientCreatorMock.create).toHaveBeenCalledWith({ authorization: 'clientToken' });
        });

        it('returns a copy of the client', async () => {
            const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            braintreeSDKCreator.initialize('clientToken');
            const client = await braintreeSDKCreator.getClient();
            expect(client).toBe(clientMock);
        });

        it('always returns the same instance of the client', async () => {
            const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            braintreeSDKCreator.initialize('clientToken');

            const client1 = await braintreeSDKCreator.getClient();
            const client2 = await braintreeSDKCreator.getClient();

            expect(braintreeScriptLoader.loadClient).toHaveBeenCalledTimes(1);
            expect(clientCreatorMock.create).toHaveBeenCalledTimes(1);
            expect(client1).toBe(client2);
        });

        it('throws if no client token is provided', async () => {
            const braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            expect(() => braintreeSDKCreator.getClient()).toThrow(expect.any(NotInitializedError));
        });
    });

    describe('#get3DS()', () => {
        let threeDSecureMock;
        let threeDSecureCreatorMock;
        let braintreeSDKCreator;

        beforeEach(() => {
            threeDSecureMock = getThreeDSecureMock();
            threeDSecureCreatorMock = getModuleCreatorMock(threeDSecureMock);
            braintreeScriptLoader.load3DS = jest.fn().mockReturnValue(Promise.resolve(threeDSecureCreatorMock));
            braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(Promise.resolve(clientMock));
        });

        it('returns a promise that resolves to the 3ds client', async () => {
            const threeDSecure = await braintreeSDKCreator.get3DS();

            expect(threeDSecureCreatorMock.create).toHaveBeenCalledWith({ client: clientMock });
            expect(threeDSecure).toBe(threeDSecureMock);
        });

        it('always returns the same instance of the 3ds client', async () => {
            const threeDSecure1 = await braintreeSDKCreator.get3DS();
            const threeDSecure2 = await braintreeSDKCreator.get3DS();

            expect(threeDSecure1).toBe(threeDSecure2);
            expect(braintreeScriptLoader.load3DS).toHaveBeenCalledTimes(1);
            expect(threeDSecureCreatorMock.create).toHaveBeenCalledTimes(1);
        });

        it('throws if getting the client throws', async () => {
            const errorMessage = 'some_error';
            braintreeSDKCreator.getClient.mockImplementation(() => { throw new Error(errorMessage); });

            expect(() => braintreeSDKCreator.get3DS()).toThrow(errorMessage);
        });
    });

    describe('#getDataCollector()', () => {
        let dataCollectorMock;
        let dataCollectorCreatorMock;
        let braintreeSDKCreator;

        beforeEach(() => {
            dataCollectorMock = getDataCollectorMock();
            dataCollectorCreatorMock = getModuleCreatorMock(dataCollectorMock);
            braintreeScriptLoader.loadDataCollector = jest.fn().mockReturnValue(Promise.resolve(dataCollectorCreatorMock));
            braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(Promise.resolve(clientMock));
        });

        it('uses the right parameters to instanciate a data collector', async () => {
            const dataCollector = await braintreeSDKCreator.getDataCollector();
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledWith({ client: clientMock, kount: true });
        });

        it('always returns the same instance of the 3ds client', async () => {
            const dataCollector1 = await braintreeSDKCreator.getDataCollector();
            const dataCollector2 = await braintreeSDKCreator.getDataCollector();
            expect(dataCollector1).toBe(dataCollector2);
            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalledTimes(1);
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledTimes(1);
        });

        it('returns the data collector information', async () => {
            const dataCollector = await braintreeSDKCreator.getDataCollector();
            expect(dataCollector).toEqual(expect.objectContaining({ deviceData: 'my_device_session_id' }));
        });

        it('catches the KOUNT_IS_NOT_ENABLED error ', async () => {
            dataCollectorCreatorMock.create.mockReturnValue(Promise.reject({ code: 'DATA_COLLECTOR_KOUNT_NOT_ENABLED' }));
            await expect(braintreeSDKCreator.getDataCollector()).resolves.toEqual(expect.objectContaining({ deviceData: undefined }));
        });

        it('throws if some other error is returned', async () => {
            dataCollectorCreatorMock.create.mockReturnValue(Promise.reject({ code: 'OTHER_RANDOM_ERROR' }));
            await expect(braintreeSDKCreator.getDataCollector()).rejects.toEqual({ code: 'OTHER_RANDOM_ERROR' });
        });
    });

    describe('#getVisaCheckout()', () => {
        let visaCheckoutMock;
        let visaCheckoutCreatorMock;
        let braintreeSDKCreator;

        beforeEach(() => {
            visaCheckoutMock = getVisaCheckoutMock();
            visaCheckoutCreatorMock = getModuleCreatorMock(visaCheckoutMock);
            braintreeScriptLoader.loadVisaCheckout = jest.fn().mockReturnValue(Promise.resolve(visaCheckoutCreatorMock));
            braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(Promise.resolve(clientMock));
        });

        it('returns a promise that resolves to the VisaCheckout client', async () => {
            const visaCheckout = await braintreeSDKCreator.getVisaCheckout();

            expect(visaCheckoutCreatorMock.create).toHaveBeenCalledWith({ client: clientMock });
            expect(visaCheckout).toBe(visaCheckoutMock);
        });

        it('always returns the same instance of the VisaCheckout client', async () => {
            const visaCheckout1 = await braintreeSDKCreator.getVisaCheckout();
            const visaCheckout2 = await braintreeSDKCreator.getVisaCheckout();

            expect(visaCheckout1).toBe(visaCheckout2);
            expect(braintreeScriptLoader.loadVisaCheckout).toHaveBeenCalledTimes(1);
            expect(visaCheckoutCreatorMock.create).toHaveBeenCalledTimes(1);
        });

        it('throws if getting the client throws', async () => {
            const errorMessage = 'some_error';
            braintreeSDKCreator.getClient.mockImplementation(() => { throw new Error(errorMessage); });

            expect(() => braintreeSDKCreator.getVisaCheckout()).toThrow(errorMessage);
        });
    });

    describe('#teardown()', () => {
        let braintreeSDKCreator;
        let dataCollectorMock;
        let threeDSecureMock;
        let visaCheckoutMock;

        beforeEach(() => {
            dataCollectorMock = getDataCollectorMock();
            threeDSecureMock = getThreeDSecureMock();
            visaCheckoutMock = getVisaCheckoutMock();

            braintreeScriptLoader.loadDataCollector = jest.fn().mockReturnValue(Promise.resolve(getModuleCreatorMock(dataCollectorMock)));
            braintreeScriptLoader.load3DS = jest.fn().mockReturnValue(Promise.resolve(getModuleCreatorMock(threeDSecureMock)));
            braintreeScriptLoader.loadVisaCheckout = jest.fn().mockReturnValue(Promise.resolve(getModuleCreatorMock(visaCheckoutMock)));
            braintreeScriptLoader.loadClient = jest.fn().mockReturnValue(Promise.resolve(getModuleCreatorMock(clientMock)));

            braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            braintreeSDKCreator.initialize('clientToken');
        });

        it('calls teardown in all the dependencies', async () => {
            await braintreeSDKCreator.get3DS();
            await braintreeSDKCreator.getDataCollector();
            await braintreeSDKCreator.getVisaCheckout();

            await braintreeSDKCreator.teardown();
            expect(dataCollectorMock.teardown).toHaveBeenCalled();
            expect(threeDSecureMock.teardown).toHaveBeenCalled();
            expect(visaCheckoutMock.teardown).toHaveBeenCalled();
        });

        it('only teardown instanciated dependencies', async () => {
            await braintreeSDKCreator.getDataCollector();

            await braintreeSDKCreator.teardown();
            expect(dataCollectorMock.teardown).toHaveBeenCalled();
            expect(threeDSecureMock.teardown).not.toHaveBeenCalled();
            expect(visaCheckoutMock.teardown).not.toHaveBeenCalled();
        });
    });
});
