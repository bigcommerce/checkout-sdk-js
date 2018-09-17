import { ScriptLoader } from '@bigcommerce/script-loader';

import { BraintreeClientCreator, BraintreeDataCollector, BraintreeHostWindow, BraintreeModuleCreator, BraintreeThreeDSecure, BraintreeVisaCheckout } from './braintree';
import BraintreeScriptLoader from './braintree-script-loader';
import {
    getClientMock,
    getDataCollectorMock, getGooglePayMock,
    getModuleCreatorMock,
    getThreeDSecureMock,
    getVisaCheckoutMock,
} from './braintree.mock';
import {GooglePayBraintreeSDK} from "../googlepay/googlepay";

describe('BraintreeScriptLoader', () => {
    let braintreeScriptLoader: BraintreeScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: BraintreeHostWindow;

    beforeEach(() => {
        mockWindow = { braintree: {} } as BraintreeHostWindow;
        scriptLoader = {} as ScriptLoader;
        braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader, mockWindow);
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
            await braintreeScriptLoader.loadClient();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//js.braintreegateway.com/web/3.37.0/js/client.min.js');
        });

        it('returns the client from the window', async () => {
            const client = await braintreeScriptLoader.loadClient();
            expect(client).toBe(clientMock);
        });
    });

    describe('#load3DS()', () => {
        let threeDSecureMock: BraintreeModuleCreator<BraintreeThreeDSecure>;

        beforeEach(() => {
            threeDSecureMock = getModuleCreatorMock(getThreeDSecureMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.threeDSecure = threeDSecureMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the ThreeDSecure library', async () => {
            await braintreeScriptLoader.load3DS();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//js.braintreegateway.com/web/3.37.0/js/three-d-secure.min.js');
        });

        it('returns the ThreeDSecure from the window', async () => {
            const threeDSecure = await braintreeScriptLoader.load3DS();
            expect(threeDSecure).toBe(threeDSecureMock);
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
            await braintreeScriptLoader.loadDataCollector();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//js.braintreegateway.com/web/3.37.0/js/data-collector.min.js');
        });

        it('returns the data collector from the window', async () => {
            const dataCollector = await braintreeScriptLoader.loadDataCollector();
            expect(dataCollector).toBe(dataCollectorMock);
        });
    });

    describe('#loadVisaCheckout()', () => {
        let visaCheckoutMock: BraintreeModuleCreator<BraintreeVisaCheckout>;

        beforeEach(() => {
            visaCheckoutMock = getModuleCreatorMock(getVisaCheckoutMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.visaCheckout = visaCheckoutMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the VisaCheckout library', async () => {
            await braintreeScriptLoader.loadVisaCheckout();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//js.braintreegateway.com/web/3.37.0/js/visa-checkout.min.js');
        });

        it('returns the VisaCheckout from the window', async () => {
            const visaCheckout = await braintreeScriptLoader.loadVisaCheckout();
            expect(visaCheckout).toBe(visaCheckoutMock);
        });
    });

    describe('#loadGooglePay()', () => {
        let googlePayMock: BraintreeModuleCreator<GooglePayBraintreeSDK>;

        beforeEach(() => {
            googlePayMock = getModuleCreatorMock(getGooglePayMock());
            scriptLoader.loadScript = jest.fn(() => {
                if (mockWindow.braintree) {
                    mockWindow.braintree.googlePayment = googlePayMock;
                }

                return Promise.resolve();
            });
        });

        it('loads the GooglePay library', async () => {
            await braintreeScriptLoader.loadGooglePaymentComponent();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//js.braintreegateway.com/web/3.37.0/js/google-payment.min.js');
        });

        it('returns the GooglePay from the window', async () => {
            const googlePay = await braintreeScriptLoader.loadGooglePaymentComponent();
            expect(googlePay).toBe(googlePayMock);
        });
    });

});
