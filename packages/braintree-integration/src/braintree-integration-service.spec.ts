import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { NotInitializedError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getShippingAddress } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    BraintreeClient,
    BraintreeConnect,
    BraintreeDataCollector,
    BraintreeHostWindow,
    BraintreeModuleCreator,
    BraintreePaypalCheckout,
} from './braintree';
import BraintreeIntegrationService from './braintree-integration-service';
import BraintreeScriptLoader from './braintree-script-loader';
import {
    getBraintreeAddress,
    getClientMock,
    getConnectMock,
    getDataCollectorMock,
    getDeviceDataMock,
    getModuleCreatorMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
} from './mocks/braintree.mock';
import { PaypalSDK } from './paypal';

describe('BraintreeIntegrationService', () => {
    let braintreeConnectMock: BraintreeConnect;
    let braintreeConnectCreatorMock: BraintreeModuleCreator<BraintreeConnect>;
    let braintreeHostWindowMock: BraintreeHostWindow;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let clientMock: BraintreeClient;
    let clientCreatorMock: BraintreeModuleCreator<BraintreeClient>;
    let dataCollectorMock: BraintreeDataCollector;
    let dataCollectorCreatorMock: BraintreeModuleCreator<BraintreeDataCollector>;
    let paypalCheckoutMock: BraintreePaypalCheckout;
    let paypalCheckoutCreatorMock: BraintreeModuleCreator<BraintreePaypalCheckout>;
    let loader: ScriptLoader;

    const clientToken = 'clientToken';
    const initializationData = {
        isAcceleratedCheckoutEnabled: false,
    };

    beforeEach(() => {
        braintreeConnectMock = getConnectMock();
        braintreeConnectCreatorMock = getModuleCreatorMock(braintreeConnectMock);
        clientMock = getClientMock();
        clientCreatorMock = getModuleCreatorMock(clientMock);
        dataCollectorMock = getDataCollectorMock();
        dataCollectorCreatorMock = getModuleCreatorMock(dataCollectorMock);
        paypalCheckoutMock = getPaypalCheckoutMock();
        paypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(paypalCheckoutMock, false);
        loader = createScriptLoader();

        braintreeHostWindowMock = window as BraintreeHostWindow;
        braintreeScriptLoader = new BraintreeScriptLoader(loader, braintreeHostWindowMock);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            braintreeHostWindowMock,
        );

        jest.spyOn(braintreeScriptLoader, 'initialize');
        jest.spyOn(braintreeScriptLoader, 'loadClient').mockImplementation(() => clientCreatorMock);
        jest.spyOn(braintreeScriptLoader, 'loadConnect').mockImplementation(
            () => braintreeConnectCreatorMock,
        );
        jest.spyOn(braintreeScriptLoader, 'loadDataCollector').mockImplementation(
            () => dataCollectorCreatorMock,
        );
        jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockImplementation(
            () => paypalCheckoutCreatorMock,
        );
        jest.spyOn(braintreeScriptLoader, 'loadBraintreeLocalMethods').mockImplementation(() =>
            getModuleCreatorMock(),
        );
    });

    describe('#initialize()', () => {
        it('initializes braintree script loader with provided initialization data', () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

            expect(braintreeScriptLoader.initialize).toHaveBeenCalledWith(initializationData);
        });
    });

    describe('#getClient()', () => {
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

    describe('#getBraintreeConnect()', () => {
        it('throws an error if client token is not provided', async () => {
            braintreeIntegrationService.initialize('', initializationData);

            try {
                await braintreeIntegrationService.getBraintreeConnect();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('loads braintree connect and creates an instance of connect object', async () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

            const result = await braintreeIntegrationService.getBraintreeConnect();

            expect(braintreeScriptLoader.loadClient).toHaveBeenCalled();
            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalled();
            expect(braintreeScriptLoader.loadConnect).toHaveBeenCalled();

            expect(result).toEqual(braintreeConnectMock);
        });
    });

    describe('#getPaypalCheckout()', () => {
        it('get paypal checkout', async () => {
            const onSuccess = jest.fn();
            const onError = jest.fn();

            braintreeIntegrationService.initialize(clientToken, initializationData);

            await braintreeIntegrationService.getPaypalCheckout({}, onSuccess, onError);

            expect(onSuccess).toHaveBeenCalledWith(paypalCheckoutMock);
            expect(onError).not.toHaveBeenCalled();
            expect(paypalCheckoutMock.loadPayPalSDK).toHaveBeenCalled();
        });

        it('get paypal checkout when paypal exists in window', async () => {
            (window as BraintreeHostWindow).paypal = {} as PaypalSDK;

            const onSuccess = jest.fn();
            const onError = jest.fn();

            braintreeIntegrationService.initialize(clientToken, initializationData);

            await braintreeIntegrationService.getPaypalCheckout({}, onSuccess, onError);

            expect(onSuccess).toHaveBeenCalledWith(paypalCheckoutMock);
            expect(onError).not.toHaveBeenCalled();
            expect(paypalCheckoutMock.loadPayPalSDK).not.toHaveBeenCalled();
        });

        it('get paypal checkout but paypalCheckoutCreator throw error', async () => {
            const onSuccess = jest.fn();
            const onError = jest.fn();

            const newPaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(
                paypalCheckoutMock,
                true,
            );

            jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockImplementation(
                () => newPaypalCheckoutCreatorMock,
            );

            braintreeIntegrationService.initialize(clientToken, initializationData);

            await braintreeIntegrationService.getPaypalCheckout({}, onSuccess, onError);

            expect(onSuccess).not.toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('#getDataCollector()', () => {
        it('uses the right parameters to instantiate a data collector', async () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

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
            braintreeIntegrationService.initialize(clientToken, initializationData);

            const dataCollector1 = await braintreeIntegrationService.getDataCollector();
            const dataCollector2 = await braintreeIntegrationService.getDataCollector();

            expect(dataCollector1).toBe(dataCollector2);
            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalledTimes(1);
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledTimes(1);
        });

        it('returns different data collector instance if it is used for PayPal', async () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

            const dataCollector = await braintreeIntegrationService.getDataCollector();
            const paypalDataCollector = await braintreeIntegrationService.getDataCollector({
                paypal: true,
            });

            expect(await braintreeIntegrationService.getDataCollector()).toBe(dataCollector);
            expect(await braintreeIntegrationService.getDataCollector({ paypal: true })).toBe(
                paypalDataCollector,
            );
        });

        it('returns the data collector information', async () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

            const dataCollector = await braintreeIntegrationService.getDataCollector();

            expect(dataCollector).toEqual(
                expect.objectContaining({ deviceData: getDeviceDataMock() }),
            );
        });

        it('catches the KOUNT_IS_NOT_ENABLED error', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockReturnValue(
                Promise.reject({ code: 'DATA_COLLECTOR_KOUNT_NOT_ENABLED' }),
            );

            braintreeIntegrationService.initialize(clientToken, initializationData);

            await expect(braintreeIntegrationService.getDataCollector()).resolves.toEqual(
                expect.objectContaining({ deviceData: undefined }),
            );
        });

        it('throws if some other error is returned', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockReturnValue(
                Promise.reject({ code: 'OTHER_RANDOM_ERROR' }),
            );

            braintreeIntegrationService.initialize(clientToken, initializationData);

            await expect(braintreeIntegrationService.getDataCollector()).rejects.toEqual({
                code: 'OTHER_RANDOM_ERROR',
            });
        });
    });

    describe('#getBraintreeEnv()', () => {
        it('get Braintree env - production', () => {
            expect(braintreeIntegrationService.getBraintreeEnv()).toBe('production');
            expect(braintreeIntegrationService.getBraintreeEnv(false)).toBe('production');
        });

        it('get Braintree env - sandbox', () => {
            expect(braintreeIntegrationService.getBraintreeEnv(true)).toBe('sandbox');
        });
    });

    describe('#mapToBraintreeAddress()', () => {
        it('maps shipping address to braintree address', () => {
            expect(
                braintreeIntegrationService.mapToBraintreeShippingAddressOverride(
                    getShippingAddress(),
                ),
            ).toEqual(getBraintreeAddress());
        });
    });

    describe('#mapToLegacyShippingAddress()', () => {
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

    describe('#loadBraintreeLocalMethods()', () => {
        it('loads local payment methods', async () => {
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
        it('calls teardown in all the dependencies', async () => {
            braintreeIntegrationService.initialize(clientToken, initializationData);

            await braintreeIntegrationService.getDataCollector();

            await braintreeIntegrationService.teardown();

            expect(dataCollectorMock.teardown).toHaveBeenCalled();
        });
    });
});
