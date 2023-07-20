import { NotInitializedError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getShippingAddress } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeHostWindow,
    BraintreeModuleCreator,
    BraintreePaypalCheckout,
    BraintreePaypalCheckoutCreator,
} from './braintree';
import BraintreeIntegrationService from './braintree-integration-service';
import BraintreeScriptLoader from './braintree-script-loader';
import {
    getBraintreeAddress,
    getClientMock,
    getDataCollectorMock,
    getDeviceDataMock,
    getModuleCreatorMock,
    getModuleCreatorNewMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
} from './braintree.mock';
import { PaypalSDK } from './paypal';

describe('BraintreeIntegrationService', () => {
    let braintreeScriptLoader: BraintreeScriptLoader;
    let clientMock: BraintreeClient;
    let clientCreatorMock: BraintreeModuleCreator<BraintreeClient>;
    let braintreeHostWindowMock: BraintreeHostWindow;
    let braintreeIntegrationService: BraintreeIntegrationService;

    const clientToken = 'clientToken';
    const initializationData = {
        isAcceleratedCheckoutEnabled: false,
    };

    beforeEach(() => {
        clientMock = getClientMock();
        braintreeScriptLoader = {} as BraintreeScriptLoader;
        braintreeHostWindowMock = {} as BraintreeHostWindow;

        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            braintreeHostWindowMock,
        );

        braintreeScriptLoader.initialize = jest.fn();
    });

    describe('#initialize()', () => {
        it('initializes braintree script loader with provided initialization data', () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

            expect(braintreeScriptLoader.initialize).toHaveBeenCalledWith(initializationData);
        });
    });

    describe('#getClient()', () => {
        beforeEach(() => {
            clientCreatorMock = getModuleCreatorMock(clientMock);
            braintreeScriptLoader.loadClient = jest
                .fn()
                .mockReturnValue(Promise.resolve(clientCreatorMock));
        });

        it('uses the right arguments to create the client', async () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

            const client = await braintreeIntegrationService.getClient();

            expect(clientCreatorMock.create).toHaveBeenCalledWith({ authorization: 'clientToken' });
            expect(client).toBe(clientMock);
        });

        it('always returns the same instance of the client', async () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

            const client1 = await braintreeIntegrationService.getClient();
            const client2 = await braintreeIntegrationService.getClient();

            expect(braintreeScriptLoader.loadClient).toHaveBeenCalledTimes(1);
            expect(clientCreatorMock.create).toHaveBeenCalledTimes(1);
            expect(client1).toBe(client2);
        });

        it('throws if no client token is provided', async () => {
            try {
                await braintreeIntegrationService.getClient();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
    });

    describe('getPaypalCheckout', () => {
        let paypalCheckoutMock: BraintreePaypalCheckout;
        let paypalCheckoutCreatorMock: BraintreePaypalCheckoutCreator;

        beforeEach(() => {
            paypalCheckoutMock = getPaypalCheckoutMock();
        });

        it('get paypal checkout', async () => {
            const onSuccess = jest.fn();
            const onError = jest.fn();

            paypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(paypalCheckoutMock, false);
            braintreeScriptLoader.loadPaypalCheckout = jest
                .fn()
                .mockReturnValue(Promise.resolve(paypalCheckoutCreatorMock));

            jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
                Promise.resolve(clientMock),
            );

            await braintreeIntegrationService.getPaypalCheckout({}, onSuccess, onError);

            expect(onSuccess).toHaveBeenCalledWith(paypalCheckoutMock);
            expect(onError).not.toHaveBeenCalled();
            expect(paypalCheckoutMock.loadPayPalSDK).toHaveBeenCalled();
        });

        it('get paypal checkout when paypal exists in window', async () => {
            const onSuccess = jest.fn();
            const onError = jest.fn();

            paypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(paypalCheckoutMock, false);
            braintreeScriptLoader.loadPaypalCheckout = jest
                .fn()
                .mockReturnValue(Promise.resolve(paypalCheckoutCreatorMock));
            braintreeIntegrationService = new BraintreeIntegrationService(braintreeScriptLoader, {
                ...braintreeHostWindowMock,
                paypal: {} as PaypalSDK,
            });

            jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
                Promise.resolve(clientMock),
            );

            await braintreeIntegrationService.getPaypalCheckout({}, onSuccess, onError);

            expect(onSuccess).toHaveBeenCalledWith(paypalCheckoutMock);
            expect(onError).not.toHaveBeenCalled();
            expect(paypalCheckoutMock.loadPayPalSDK).not.toHaveBeenCalled();
        });

        it('get paypal checkout but paypalCheckoutCreator throw error', async () => {
            const onSuccess = jest.fn();
            const onError = jest.fn();

            paypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(paypalCheckoutMock, true);
            braintreeScriptLoader.loadPaypalCheckout = jest
                .fn()
                .mockReturnValue(Promise.resolve(paypalCheckoutCreatorMock));

            jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
                Promise.resolve(clientMock),
            );

            await braintreeIntegrationService.getPaypalCheckout({}, onSuccess, onError);

            expect(onSuccess).not.toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('#getDataCollector()', () => {
        let dataCollectorMock: BraintreeDataCollector;
        let dataCollectorCreatorMock: BraintreeModuleCreator<BraintreeDataCollector>;

        beforeEach(() => {
            dataCollectorMock = getDataCollectorMock();
            dataCollectorCreatorMock = getModuleCreatorNewMock(dataCollectorMock);
            braintreeScriptLoader.loadDataCollector = jest
                .fn()
                .mockReturnValue(Promise.resolve(dataCollectorCreatorMock));

            jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
                Promise.resolve(clientMock),
            );
        });

        it('uses the right parameters to instantiate a data collector', async () => {
            await braintreeIntegrationService.getDataCollector();

            expect(dataCollectorCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
                kount: true,
            });

            await braintreeIntegrationService.getDataCollector({ paypal: true });

            expect(dataCollectorCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
                kount: true,
                paypal: true,
            });
        });

        it('always returns the same instance of the data collector', async () => {
            const dataCollector1 = await braintreeIntegrationService.getDataCollector();
            const dataCollector2 = await braintreeIntegrationService.getDataCollector();

            expect(dataCollector1).toBe(dataCollector2);
            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalledTimes(1);
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledTimes(1);
        });

        it('returns different data collector instance if it is used for PayPal', async () => {
            const dataCollector = await braintreeIntegrationService.getDataCollector();
            const paypalDataCollector = await braintreeIntegrationService.getDataCollector({
                paypal: true,
            });

            expect(dataCollector).not.toBe(paypalDataCollector);
            expect(await braintreeIntegrationService.getDataCollector()).toBe(dataCollector);
            expect(await braintreeIntegrationService.getDataCollector({ paypal: true })).toBe(
                paypalDataCollector,
            );
        });

        it('returns the data collector information', async () => {
            const dataCollector = await braintreeIntegrationService.getDataCollector();

            expect(dataCollector).toEqual(
                expect.objectContaining({ deviceData: getDeviceDataMock() }),
            );
        });

        it('catches the KOUNT_IS_NOT_ENABLED error', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockReturnValue(
                Promise.reject({ code: 'DATA_COLLECTOR_KOUNT_NOT_ENABLED' }),
            );

            await expect(braintreeIntegrationService.getDataCollector()).resolves.toEqual(
                expect.objectContaining({ deviceData: undefined }),
            );
        });

        it('throws if some other error is returned', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockReturnValue(
                Promise.reject({ code: 'OTHER_RANDOM_ERROR' }),
            );

            await expect(braintreeIntegrationService.getDataCollector()).rejects.toEqual({
                code: 'OTHER_RANDOM_ERROR',
            });
        });
    });

    describe('getBraintreeEnv', () => {
        it('get Braintree env - production', () => {
            expect(braintreeIntegrationService.getBraintreeEnv()).toBe('production');
            expect(braintreeIntegrationService.getBraintreeEnv(false)).toBe('production');
        });

        it('get Braintree env - sandbox', () => {
            expect(braintreeIntegrationService.getBraintreeEnv(true)).toBe('sandbox');
        });
    });

    describe('mapToBraintreeAddress()', () => {
        it('maps shipping address to braintree address', () => {
            expect(
                braintreeIntegrationService.mapToBraintreeShippingAddressOverride(
                    getShippingAddress(),
                ),
            ).toEqual(getBraintreeAddress());
        });
    });

    describe('mapToLegacyShippingAddress()', () => {
        const detailsMock = {
            email: 'test@test.com',
            phone: '55555555555',
            shippingAddress: {
                recipientName: 'John Doe',
                line1: 'shipping_line1',
                line2: 'shipping_line2',
                city: 'shipping_city',
                state: 'shipping_state',
                postalCode: '03444',
                countryCode: 'US',
            },
        };

        it('maps details to legacy shipping address', () => {
            const props = {
                ...detailsMock,
                billingAddress: undefined,
            };

            const expects = {
                email: detailsMock.email,
                first_name: 'John',
                last_name: 'Doe',
                phone_number: detailsMock.phone,
                address_line_1: detailsMock.shippingAddress.line1,
                address_line_2: detailsMock.shippingAddress.line2,
                city: detailsMock.shippingAddress.city,
                state: detailsMock.shippingAddress.state,
                country_code: detailsMock.shippingAddress.countryCode,
                postal_code: detailsMock.shippingAddress.postalCode,
            };

            expect(braintreeIntegrationService.mapToLegacyShippingAddress(props)).toEqual(expects);
        });
    });

    describe('loadBraintreeLocalMethods', () => {
        it('loads local payment methods', async () => {
            braintreeScriptLoader.loadBraintreeLocalMethods = jest
                .fn()
                .mockReturnValue({ create: jest.fn() });
            braintreeScriptLoader.loadClient = jest.fn().mockReturnValue({ create: jest.fn() });
            braintreeIntegrationService.initialize(clientToken, initializationData);
            await braintreeIntegrationService.loadBraintreeLocalMethods(jest.fn(), '');

            expect(braintreeScriptLoader.loadBraintreeLocalMethods).toHaveBeenCalled();
        });
    });

    describe('mapToLegacyBillingAddress()', () => {
        const detailsMock = {
            username: 'johndoe',
            email: 'test@test.com',
            payerId: '1122abc',
            firstName: 'John',
            lastName: 'Doe',
            countryCode: 'US',
            phone: '55555555555',
            billingAddress: {
                line1: 'billing_line1',
                line2: 'billing_line2',
                city: 'billing_city',
                state: 'billing_state',
                postalCode: '03444',
                countryCode: 'US',
            },
            shippingAddress: {
                recipientName: 'John Doe',
                line1: 'shipping_line1',
                line2: 'shipping_line2',
                city: 'shipping_city',
                state: 'shipping_state',
                postalCode: '03444',
                countryCode: 'US',
            },
        };

        it('maps details to legacy billing address using billing details as main address', () => {
            const props = detailsMock;

            const expects = {
                email: detailsMock.email,
                first_name: detailsMock.firstName,
                last_name: detailsMock.lastName,
                phone_number: detailsMock.phone,
                address_line_1: detailsMock.billingAddress.line1,
                address_line_2: detailsMock.billingAddress.line2,
                city: detailsMock.billingAddress.city,
                state: detailsMock.billingAddress.state,
                country_code: detailsMock.billingAddress.countryCode,
                postal_code: detailsMock.billingAddress.postalCode,
            };

            expect(braintreeIntegrationService.mapToLegacyBillingAddress(props)).toEqual(expects);
        });

        it('maps details to legacy billing address using shipping details as main address if billing details is not provided', () => {
            const props = {
                ...detailsMock,
                billingAddress: undefined,
            };

            const expects = {
                email: detailsMock.email,
                first_name: detailsMock.firstName,
                last_name: detailsMock.lastName,
                phone_number: detailsMock.phone,
                address_line_1: detailsMock.shippingAddress.line1,
                address_line_2: detailsMock.shippingAddress.line2,
                city: detailsMock.shippingAddress.city,
                state: detailsMock.shippingAddress.state,
                country_code: detailsMock.shippingAddress.countryCode,
                postal_code: detailsMock.shippingAddress.postalCode,
            };

            expect(braintreeIntegrationService.mapToLegacyBillingAddress(props)).toEqual(expects);
        });
    });

    describe('remove element', () => {
        let container: HTMLDivElement;

        beforeEach(() => {
            container = document.createElement('div');
            container.setAttribute('id', 'braintree-id');
            document.body.appendChild(container);
        });

        afterAll(() => {
            document.body.removeChild(container);
        });

        it('remove existing element', () => {
            braintreeIntegrationService.removeElement('braintree-id');

            expect(document.getElementById('braintree-id')).toBeNull();
        });

        it('remove not existing element', () => {
            braintreeIntegrationService.removeElement('any-other-id');

            expect(document.getElementById('braintree-id')).not.toBeNull();
        });
    });

    describe('#teardown()', () => {
        let dataCollectorMock: BraintreeDataCollector;

        beforeEach(() => {
            dataCollectorMock = getDataCollectorMock();

            braintreeScriptLoader.loadDataCollector = jest
                .fn()
                .mockReturnValue(Promise.resolve(getModuleCreatorMock(dataCollectorMock)));
            braintreeScriptLoader.loadClient = jest
                .fn()
                .mockReturnValue(Promise.resolve(getModuleCreatorMock(clientMock)));

            braintreeIntegrationService.initialize(clientToken, initializationData);
        });

        it('calls teardown in all the dependencies', async () => {
            await braintreeIntegrationService.getDataCollector();

            await braintreeIntegrationService.teardown();

            expect(dataCollectorMock.teardown).toHaveBeenCalled();
        });
    });
});
