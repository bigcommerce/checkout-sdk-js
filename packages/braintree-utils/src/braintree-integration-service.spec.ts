import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    NotInitializedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeIntegrationService from './braintree-integration-service';
import BraintreeScriptLoader from './braintree-script-loader';
import BraintreeSDKVersionManager from './braintree-sdk-version-manager';
import {
    getBillingAddress,
    getBraintreeAddress,
    getBraintreePaymentData,
    getClientMock,
    getDataCollectorMock,
    getDeviceDataMock,
    getFastlaneMock,
    getModuleCreatorMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
    getThreeDSecureMock,
} from './mocks';
import { PaypalSDK } from './paypal';
import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeFastlane,
    BraintreeHostWindow,
    BraintreeModuleCreator,
    BraintreePaypalCheckout,
    BraintreeThreeDSecure,
} from './types';

describe('BraintreeIntegrationService', () => {
    let braintreeFastlaneMock: BraintreeFastlane;
    let braintreeFastlaneCreatorMock: BraintreeModuleCreator<BraintreeFastlane>;
    let braintreeHostWindowMock: BraintreeHostWindow;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let clientMock: BraintreeClient;
    let clientCreatorMock: BraintreeModuleCreator<BraintreeClient>;
    let dataCollectorMock: BraintreeDataCollector;
    let threeDSecureMock: BraintreeThreeDSecure;
    let threeDSecureCreatorMock: BraintreeModuleCreator<BraintreeThreeDSecure>;
    let dataCollectorCreatorMock: BraintreeModuleCreator<BraintreeDataCollector>;
    let paypalCheckoutMock: BraintreePaypalCheckout;
    let paypalCheckoutCreatorMock: BraintreeModuleCreator<BraintreePaypalCheckout>;
    let loader: ScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;

    const clientToken = 'clientToken';

    beforeEach(() => {
        braintreeFastlaneMock = getFastlaneMock();
        braintreeFastlaneCreatorMock = getModuleCreatorMock(braintreeFastlaneMock);
        clientMock = getClientMock();
        clientCreatorMock = getModuleCreatorMock(clientMock);
        dataCollectorMock = getDataCollectorMock();
        dataCollectorCreatorMock = getModuleCreatorMock(dataCollectorMock);
        paypalCheckoutMock = getPaypalCheckoutMock();
        paypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(paypalCheckoutMock, false);
        threeDSecureMock = getThreeDSecureMock();
        threeDSecureCreatorMock = getModuleCreatorMock(threeDSecureMock);
        loader = createScriptLoader();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);

        braintreeHostWindowMock = window as BraintreeHostWindow;
        braintreeScriptLoader = new BraintreeScriptLoader(
            loader,
            braintreeHostWindowMock,
            braintreeSDKVersionManager,
        );
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            braintreeHostWindowMock,
        );

        jest.spyOn(braintreeScriptLoader, 'loadClient').mockResolvedValue(clientCreatorMock);
        jest.spyOn(braintreeScriptLoader, 'loadFastlane').mockResolvedValue(
            braintreeFastlaneCreatorMock,
        );
        jest.spyOn(braintreeScriptLoader, 'loadDataCollector').mockResolvedValue(
            dataCollectorCreatorMock,
        );
        jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockResolvedValue(
            paypalCheckoutCreatorMock,
        );

        jest.spyOn(braintreeScriptLoader, 'load3DS').mockResolvedValue(threeDSecureCreatorMock);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();

        localStorage.clear();
    });

    describe('#getPaypal', () => {
        it('throws an error if PayPal SDK cannot be loaded or created', async () => {
            jest.spyOn(braintreeScriptLoader, 'loadPaypal').mockRejectedValue(
                new Error('PayPal SDK failed to load'),
            );

            braintreeIntegrationService.initialize(clientToken);

            await expect(braintreeIntegrationService.getPaypal()).rejects.toThrow(
                'PayPal SDK failed to load',
            );
        });

        it('throws if PayPal creation fails after being loaded', async () => {
            jest.spyOn(braintreeScriptLoader, 'loadPaypal').mockResolvedValueOnce({
                create: jest.fn().mockRejectedValue(new Error('PayPal creation failed')),
            });

            braintreeIntegrationService.initialize(clientToken);

            await expect(braintreeIntegrationService.getPaypal()).rejects.toThrow(
                'PayPal creation failed',
            );
        });
    });

    describe('#getClient()', () => {
        it('uses the right arguments to create the client', async () => {
            braintreeIntegrationService.initialize(clientToken);

            const client = await braintreeIntegrationService.getClient();

            expect(clientCreatorMock.create).toHaveBeenCalledWith({ authorization: 'clientToken' });
            expect(client).toBe(clientMock);
        });

        it('always returns the same instance of the client', async () => {
            braintreeIntegrationService.initialize(clientToken);

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

    describe('#getBraintreeFastlane()', () => {
        it('throws an error if client token is not provided', async () => {
            braintreeIntegrationService.initialize('');

            try {
                await braintreeIntegrationService.getBraintreeFastlane();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('loads braintree fastlane and creates an instance of fastlane object', async () => {
            braintreeIntegrationService.initialize(clientToken);

            const result = await braintreeIntegrationService.getBraintreeFastlane();

            expect(braintreeScriptLoader.loadClient).toHaveBeenCalled();
            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalled();
            expect(braintreeScriptLoader.loadFastlane).toHaveBeenCalled();

            expect(braintreeFastlaneCreatorMock.create).toHaveBeenCalledWith({
                authorization: clientToken,
                client: clientMock,
                deviceData: getDeviceDataMock(),
                styles: {
                    root: {
                        backgroundColorPrimary: 'transparent',
                    },
                },
            });

            expect(result).toEqual(braintreeFastlaneMock);
        });

        it('sets fastlane to sandbox mode if test mode is enabled', async () => {
            jest.spyOn(Storage.prototype, 'setItem').mockImplementation(jest.fn);

            braintreeIntegrationService.initialize(clientToken);

            await braintreeIntegrationService.getBraintreeFastlane('asd123', true);

            expect(window.localStorage.setItem).toHaveBeenCalledWith('fastlaneEnv', 'sandbox');
        });

        it('does not switch fastlane to sandbox mode if test mode is disabled', async () => {
            jest.spyOn(Storage.prototype, 'setItem').mockImplementation(jest.fn);

            braintreeIntegrationService.initialize(clientToken);

            await braintreeIntegrationService.getBraintreeFastlane('asd123', false);

            expect(window.localStorage.setItem).not.toHaveBeenCalled();
        });
    });

    describe('#getPaypalCheckout()', () => {
        it('get paypal checkout', async () => {
            const onSuccess = jest.fn();
            const onError = jest.fn();

            braintreeIntegrationService.initialize(clientToken);

            await braintreeIntegrationService.getPaypalCheckout({}, onSuccess, onError);

            expect(onSuccess).toHaveBeenCalledWith(paypalCheckoutMock);
            expect(onError).not.toHaveBeenCalled();
            expect(paypalCheckoutMock.loadPayPalSDK).toHaveBeenCalled();
        });

        it('get paypal checkout when paypal exists in window', async () => {
            (window as BraintreeHostWindow).paypal = {} as PaypalSDK;

            const onSuccess = jest.fn();
            const onError = jest.fn();

            braintreeIntegrationService.initialize(clientToken);

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

            jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockResolvedValue(
                newPaypalCheckoutCreatorMock,
            );

            braintreeIntegrationService.initialize(clientToken);

            await braintreeIntegrationService.getPaypalCheckout({}, onSuccess, onError);

            expect(onSuccess).not.toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();
        });
    });

    describe('#getDataCollector()', () => {
        it('uses the right parameters to instantiate a data collector', async () => {
            braintreeIntegrationService.initialize(clientToken);

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
            braintreeIntegrationService.initialize(clientToken);

            const dataCollector1 = await braintreeIntegrationService.getDataCollector();
            const dataCollector2 = await braintreeIntegrationService.getDataCollector();

            expect(dataCollector1).toBe(dataCollector2);
            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalledTimes(1);
            expect(dataCollectorCreatorMock.create).toHaveBeenCalledTimes(1);
        });

        it('returns different data collector instance if it is used for PayPal', async () => {
            braintreeIntegrationService.initialize(clientToken);

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
            braintreeIntegrationService.initialize(clientToken);

            const dataCollector = await braintreeIntegrationService.getDataCollector();

            expect(dataCollector).toEqual(
                expect.objectContaining({ deviceData: getDeviceDataMock() }),
            );
        });

        it('catches the KOUNT_IS_NOT_ENABLED error', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockReturnValue(
                Promise.reject({ code: 'DATA_COLLECTOR_KOUNT_NOT_ENABLED' }),
            );

            braintreeIntegrationService.initialize(clientToken);

            await expect(braintreeIntegrationService.getDataCollector()).resolves.toEqual(
                expect.objectContaining({ deviceData: undefined }),
            );
        });

        it('throws if some other error is returned', async () => {
            jest.spyOn(dataCollectorCreatorMock, 'create').mockReturnValue(
                Promise.reject({ code: 'OTHER_RANDOM_ERROR' }),
            );

            braintreeIntegrationService.initialize(clientToken);

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

        it('returns empty string if name is empty', () => {
            const details = {
                email: 'test@test.com',
                phone: '55555555555',
                shippingAddress: {
                    recipientName: '',
                    line1: 'test',
                    line2: 'test',
                    city: 'New York',
                    state: 'New York',
                    postalCode: '01111',
                    countryCode: '01',
                },
            };

            const expects = {
                email: 'test@test.com',
                phone_number: '55555555555',
                first_name: '',
                last_name: '',
                address_line_1: 'test',
                address_line_2: 'test',
                city: 'New York',
                state: 'New York',
                country_code: '01',
                postal_code: '01111',
            };

            expect(braintreeIntegrationService.mapToLegacyShippingAddress(details)).toEqual(
                expects,
            );
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

    describe('#getSessionId', () => {
        it('provides riskCorrelationId to data collector', async () => {
            const cartIdMock = 'cartId-asdasd';

            braintreeIntegrationService.initialize(clientToken);
            await braintreeIntegrationService.getSessionId(cartIdMock);

            expect(dataCollectorCreatorMock.create).toHaveBeenCalledWith({
                client: clientMock,
                kount: true,
                riskCorrelationId: cartIdMock,
            });
        });
    });

    describe('#verifyCard', () => {
        const threeDSecureOptions = {
            nonce: '3ds_nonce',
            amount: 122,
        };
        it('tokenizes the card with the right params', async () => {
            jest.spyOn(braintreeIntegrationService, 'tokenizeCard');
            jest.spyOn(braintreeIntegrationService, 'verifyCard');
            jest.spyOn(braintreeScriptLoader, 'load3DS');
            jest.spyOn(braintreeScriptLoader, 'loadClient').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    request: jest.fn().mockResolvedValue({
                        creditCards: [
                            {
                                nonce: 'nonce',
                                details: { bin: 'bin' },
                            },
                        ],
                    }),
                }),
            });
            braintreeIntegrationService.initialize(clientToken, threeDSecureOptions);
            await braintreeIntegrationService.verifyCard(
                getBraintreePaymentData(),
                getBillingAddress(),
                122,
            );

            expect(braintreeIntegrationService.tokenizeCard).toHaveBeenCalledWith(
                getBraintreePaymentData(),
                getBillingAddress(),
            );
        });

        it('loads 3ds', async () => {
            jest.spyOn(braintreeScriptLoader, 'loadClient').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    request: jest.fn().mockResolvedValue({
                        creditCards: [
                            {
                                nonce: 'nonce',
                                details: { bin: 'bin' },
                            },
                        ],
                    }),
                }),
            });
            braintreeIntegrationService.initialize(clientToken, threeDSecureOptions);
            await braintreeIntegrationService.verifyCard(
                getBraintreePaymentData(),
                getBillingAddress(),
                122,
            );

            expect(braintreeScriptLoader.load3DS).toHaveBeenCalled();
        });
    });

    describe('#teardown()', () => {
        it('calls teardown in all the dependencies', async () => {
            braintreeIntegrationService.initialize(clientToken);

            await braintreeIntegrationService.getDataCollector();

            await braintreeIntegrationService.teardown();

            expect(dataCollectorMock.teardown).toHaveBeenCalled();
        });
    });
});
