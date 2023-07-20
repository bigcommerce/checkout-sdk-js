import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeClientCreator,
    BraintreeDataCollector,
    BraintreeHostWindow,
    BraintreeLocalPayment,
    BraintreeModuleCreator,
    BraintreePaypalCheckoutCreator,
} from './braintree';
import BraintreeScriptLoader from './braintree-script-loader';
import {
    getBraintreeLocalPaymentMock,
    getClientMock,
    getDataCollectorMock,
    getModuleCreatorMock,
    getPaypalCheckoutMock,
} from './braintree.mock';

const VERSION = '3.95.0';
const ALPHA_VERSION = '3.95.0-connect-alpha.7';

describe('BraintreeScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let mockWindow: BraintreeHostWindow;

    const braintreeInitializationData = {
        isAcceleratedCheckoutEnabled: true,
    };

    beforeEach(() => {
        mockWindow = { braintree: {} } as BraintreeHostWindow;
        scriptLoader = {} as ScriptLoader;
    });

    describe('#loadClient()', () => {
        let clientMock: BraintreeClientCreator;

        beforeEach(() => {
            clientMock = getModuleCreatorMock(getClientMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.client = clientMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the client', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
            const client = await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${VERSION}/js/client.min.js`,
            );
            expect(client).toBe(clientMock);
        });

        it('loads the client with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(braintreeInitializationData);

            const client = await braintreeScriptLoader.loadClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${ALPHA_VERSION}/js/client.min.js`,
            );
            expect(client).toBe(clientMock);
        });

        it('loads the client throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
            );

            try {
                await braintreeScriptLoader.loadClient();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads the client throw error if client does not exist in window.braintree', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, {
                braintree: {},
            } as BraintreeHostWindow);

            try {
                await braintreeScriptLoader.loadClient();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#loadPaypalCheckout', () => {
        let paypalCheckoutMock: BraintreePaypalCheckoutCreator;

        beforeEach(() => {
            paypalCheckoutMock = getPaypalCheckoutMock();
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.paypalCheckout = paypalCheckoutMock;
                }

                return Promise.resolve();
            });
        });

        it('loads PayPal checkout', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
            const paypalCheckout = await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${VERSION}/js/paypal-checkout.min.js`,
            );
            expect(paypalCheckout).toBe(paypalCheckoutMock);
        });

        it('loads PayPal checkout with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(braintreeInitializationData);

            const paypalCheckout = await braintreeScriptLoader.loadPaypalCheckout();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${ALPHA_VERSION}/js/paypal-checkout.min.js`,
            );
            expect(paypalCheckout).toBe(paypalCheckoutMock);
        });

        it('loads PayPal checkout throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
            );

            try {
                await braintreeScriptLoader.loadPaypalCheckout();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads PayPal checkout throw error if client does not exist in window.paypalCheckout', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, {
                braintree: {},
            } as BraintreeHostWindow);

            try {
                await braintreeScriptLoader.loadPaypalCheckout();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#loadBraintreeLocalMethods', () => {
        let localPayment: BraintreeLocalPayment;

        beforeEach(() => {
            localPayment = getBraintreeLocalPaymentMock();
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.localPayment = localPayment;
                }

                return Promise.resolve();
            });
        });

        it('loads local payment methods', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            await braintreeScriptLoader.loadBraintreeLocalMethods();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${VERSION}/js/local-payment.min.js`,
            );
        });

        it('loads local payment methods with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(braintreeInitializationData);

            await braintreeScriptLoader.loadBraintreeLocalMethods();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${ALPHA_VERSION}/js/local-payment.min.js`,
            );
        });
    });

    describe('#loadDataCollector()', () => {
        let dataCollectorMock: BraintreeModuleCreator<BraintreeDataCollector>;

        beforeEach(() => {
            dataCollectorMock = getModuleCreatorMock(getDataCollectorMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.dataCollector = dataCollectorMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the data collector library', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${VERSION}/js/data-collector.min.js`,
            );
            expect(dataCollector).toBe(dataCollectorMock);
        });

        it('loads the data collector library with braintree sdk alpha version', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);

            braintreeScriptLoader.initialize(braintreeInitializationData);

            const dataCollector = await braintreeScriptLoader.loadDataCollector();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `//js.braintreegateway.com/web/${ALPHA_VERSION}/js/data-collector.min.js`,
            );
            expect(dataCollector).toBe(dataCollectorMock);
        });

        it('loads the data collector library throw error if braintree does not exist in window', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(
                scriptLoader,
                {} as BraintreeHostWindow,
            );

            try {
                await braintreeScriptLoader.loadDataCollector();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });

        it('loads the data collector library throw error if client does not exist in window.dataCollector', async () => {
            const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, {
                braintree: {},
            } as BraintreeHostWindow);

            try {
                await braintreeScriptLoader.loadDataCollector();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
