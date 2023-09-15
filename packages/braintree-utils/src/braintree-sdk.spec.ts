import { createScriptLoader } from '@bigcommerce/script-loader';

import { getConfig } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeScriptLoader from './braintree-script-loader';
import BraintreeSdk from './braintree-sdk';
import {
    getClientMock,
    getDataCollectorMock,
    getModuleCreatorMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
    getPaypalSDKMock,
} from './mocks';
import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeModuleCreator,
    BraintreePaypalCheckout,
    PaypalSDK,
} from './types';

describe('BraintreeSdk', () => {
    let braintreeClient: BraintreeClient;
    let braintreeClientCreator: BraintreeModuleCreator<BraintreeClient>;
    let braintreeDataCollector: BraintreeDataCollector;
    let braintreeDataCollectorCreator: BraintreeModuleCreator<BraintreeDataCollector>;
    let braintreePayPalCheckout: BraintreePaypalCheckout;
    let braintreePayPalCheckoutCreator: BraintreeModuleCreator<BraintreePaypalCheckout>;
    let braintreePayPalSdk: PaypalSDK;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeSdkMock: BraintreeSdk;

    beforeEach(() => {
        braintreeScriptLoader = new BraintreeScriptLoader(createScriptLoader(), window);
        braintreeSdkMock = new BraintreeSdk(braintreeScriptLoader);

        jest.spyOn(braintreeScriptLoader, 'initialize');

        braintreeClient = getClientMock();
        braintreeClientCreator = getModuleCreatorMock(braintreeClient);
        jest.spyOn(braintreeScriptLoader, 'loadClient').mockImplementation(
            () => braintreeClientCreator,
        );

        braintreePayPalCheckout = getPaypalCheckoutMock();
        braintreePayPalCheckoutCreator = getPayPalCheckoutCreatorMock(braintreePayPalCheckout);
        jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockImplementation(
            () => braintreePayPalCheckoutCreator,
        );

        braintreePayPalSdk = getPaypalSDKMock();
        jest.spyOn(braintreePayPalCheckout, 'loadPayPalSDK').mockImplementation(
            () => braintreePayPalSdk,
        );

        braintreeDataCollector = getDataCollectorMock();
        braintreeDataCollectorCreator = getModuleCreatorMock(braintreeDataCollector);
        jest.spyOn(braintreeScriptLoader, 'loadDataCollector').mockImplementation(
            () => braintreeDataCollectorCreator,
        );
    });

    describe('#initialize()', () => {
        it('initializes braintree script loader to set valid braintree sdk version', () => {
            const storeConfig = getConfig().storeConfig;

            braintreeSdkMock.initialize(getConfig().storeConfig);

            expect(braintreeScriptLoader.initialize).toHaveBeenCalledWith(storeConfig);
        });
    });

    describe('#getBraintreeClient()', () => {
        const mockClientToken = 'mockClientToken';

        it('creates and returns new braintree client', async () => {
            expect(await braintreeSdkMock.getBraintreeClient(mockClientToken)).toEqual(
                braintreeClient,
            );
            expect(braintreeScriptLoader.loadClient).toHaveBeenCalled();
            expect(braintreeClientCreator.create).toHaveBeenCalledWith({
                authorization: mockClientToken,
            });
        });

        it('does not create new braintree client on second call', async () => {
            await braintreeSdkMock.getBraintreeClient(mockClientToken);
            await braintreeSdkMock.getBraintreeClient(mockClientToken);

            expect(braintreeScriptLoader.loadClient).toHaveBeenCalledTimes(1);
            expect(braintreeClientCreator.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getBraintreePaypalCheckout()', () => {
        it('creates and returns braintree paypal checkout instance', async () => {
            const paypalCheckoutConfig = { client: braintreeClient };
            const paypalCheckoutCallback = expect.any(Function);

            expect(await braintreeSdkMock.getBraintreePaypalCheckout(braintreeClient)).toEqual(
                braintreePayPalCheckout,
            );

            expect(braintreeScriptLoader.loadPaypalCheckout).toHaveBeenCalled();
            expect(braintreePayPalCheckoutCreator.create).toHaveBeenCalledWith(
                paypalCheckoutConfig,
                paypalCheckoutCallback,
            );
        });

        it('creates braintree paypal checkout instance only once', async () => {
            await braintreeSdkMock.getBraintreePaypalCheckout(braintreeClient);
            await braintreeSdkMock.getBraintreePaypalCheckout(braintreeClient);

            expect(braintreeScriptLoader.loadPaypalCheckout).toHaveBeenCalledTimes(1);
            expect(braintreePayPalCheckoutCreator.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getBraintreePayPalSdk()', () => {
        const braintreePaypalSdkOptions = {
            components: 'buttons, messages',
            currency: 'USD',
            intent: 'authorize',
            isCreditEnabled: false,
        };

        it('loads and returns paypal sdk', async () => {
            expect(
                await braintreeSdkMock.getBraintreePayPalSdk(
                    braintreePayPalCheckout,
                    braintreePaypalSdkOptions,
                ),
            ).toEqual(braintreePayPalSdk);

            expect(braintreePayPalCheckout.loadPayPalSDK).toHaveBeenCalledWith({
                components: 'buttons, messages',
                currency: 'USD',
                intent: 'authorize',
            });
        });

        it('loads and returns paypal sdk with PayLater', async () => {
            const options = {
                ...braintreePaypalSdkOptions,
                isCreditEnabled: true,
            };

            expect(
                await braintreeSdkMock.getBraintreePayPalSdk(braintreePayPalCheckout, options),
            ).toEqual(braintreePayPalSdk);
            expect(braintreePayPalCheckout.loadPayPalSDK).toHaveBeenCalledWith({
                components: 'buttons, messages',
                currency: 'USD',
                intent: 'authorize',
                'enable-funding': 'paylater',
            });
        });

        it('loads paypal sdk only once', async () => {
            await braintreeSdkMock.getBraintreePayPalSdk(
                braintreePayPalCheckout,
                braintreePaypalSdkOptions,
            );

            await braintreeSdkMock.getBraintreePayPalSdk(
                braintreePayPalCheckout,
                braintreePaypalSdkOptions,
            );

            expect(braintreePayPalCheckout.loadPayPalSDK).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getDataCollector', () => {
        it('creates and returns data collector instance', async () => {
            const config = {
                client: braintreeClient,
                kount: true,
            };

            expect(await braintreeSdkMock.getDataCollector(braintreeClient)).toEqual(
                braintreeDataCollector,
            );
            expect(braintreeDataCollectorCreator.create).toHaveBeenCalledWith(config);
        });

        it('creates and returns data collector instance with paypal and risk correlation id param', async () => {
            const config = {
                client: braintreeClient,
                kount: true,
                paypal: true,
                riskCorrelationId: 'cartId',
            };

            expect(
                await braintreeSdkMock.getDataCollector(braintreeClient, {
                    paypal: true,
                    riskCorrelationId: 'cartId',
                }),
            ).toEqual(braintreeDataCollector);
            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalled();
            expect(braintreeDataCollectorCreator.create).toHaveBeenCalledWith(config);
        });

        it('creates data collector instance only once for the same options', async () => {
            await braintreeSdkMock.getDataCollector(braintreeClient);
            await braintreeSdkMock.getDataCollector(braintreeClient);

            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalledTimes(1);
            expect(braintreeDataCollectorCreator.create).toHaveBeenCalledTimes(1);
        });

        it('creates different data collectors for different options', async () => {
            await braintreeSdkMock.getDataCollector(braintreeClient);
            await braintreeSdkMock.getDataCollector(braintreeClient, { paypal: true });

            expect(braintreeScriptLoader.loadDataCollector).toHaveBeenCalledTimes(2);
            expect(braintreeDataCollectorCreator.create).toHaveBeenCalledTimes(2);
        });

        it('catches specific error if KOUNT no enabled and returns empty device data', async () => {
            jest.spyOn(braintreeDataCollectorCreator, 'create').mockImplementation(() =>
                Promise.reject({ code: 'DATA_COLLECTOR_KOUNT_NOT_ENABLED' }),
            );

            await expect(braintreeSdkMock.getDataCollector(braintreeClient)).resolves.toEqual(
                expect.objectContaining({ deviceData: undefined }),
            );
        });

        it('throws an error on data collector fail', async () => {
            jest.spyOn(braintreeDataCollectorCreator, 'create').mockImplementation(() => {
                throw new Error();
            });

            try {
                await braintreeSdkMock.getDataCollector(braintreeClient);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });
});
