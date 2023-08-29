import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayScriptLoader, { GOOGLE_PAY_LIBRARY } from './google-pay-script-loader';
import {
    GooglePayHostWindow,
    GooglePaymentsClient,
    GooglePaymentsClientConstructor,
} from './types';

describe('GooglePayScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let googlePayWindow: GooglePayHostWindow;
    let googlePayScriptLoader: GooglePayScriptLoader;
    let googlePaymentsClientMock: GooglePaymentsClient;
    let googlePaymentsClientConstructorMock: GooglePaymentsClientConstructor;

    beforeEach(() => {
        scriptLoader = createScriptLoader();
        googlePayWindow = window;
        googlePayScriptLoader = new GooglePayScriptLoader(scriptLoader, googlePayWindow);
        googlePaymentsClientMock = {} as GooglePaymentsClient;
        googlePaymentsClientConstructorMock = jest.fn(() => googlePaymentsClientMock);

        jest.spyOn(scriptLoader, 'loadScript').mockImplementation(() => {
            googlePayWindow.google = {
                payments: {
                    api: {
                        PaymentsClient: googlePaymentsClientConstructorMock,
                    },
                },
            };

            return Promise.resolve();
        });
    });

    describe('#getGooglePaymentsClient', () => {
        it('should load the Google Pay API JavaScript library successfully', async () => {
            await googlePayScriptLoader.getGooglePaymentsClient();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(GOOGLE_PAY_LIBRARY);
        });

        it('should initialize a PRODUCTION PaymentsClient object successfully', async () => {
            await googlePayScriptLoader.getGooglePaymentsClient();

            expect(googlePaymentsClientConstructorMock).toHaveBeenCalledWith({
                environment: 'PRODUCTION',
            });
        });

        it('should initialize a TEST PaymentsClient object successfully', async () => {
            await googlePayScriptLoader.getGooglePaymentsClient(true);

            expect(googlePaymentsClientConstructorMock).toHaveBeenCalledWith({
                environment: 'TEST',
            });
        });

        it('should initialize ONE PaymentsClient object successfully', async () => {
            await googlePayScriptLoader.getGooglePaymentsClient();
            await googlePayScriptLoader.getGooglePaymentsClient();

            expect(googlePaymentsClientConstructorMock).toHaveBeenCalledTimes(1);
        });

        it('should return a PaymentsClient object successfully', async () => {
            const paymentsClient = await googlePayScriptLoader.getGooglePaymentsClient();

            expect(paymentsClient).toEqual(googlePaymentsClientMock);
        });

        it('should return the SAME PaymentsClient object successfully', async () => {
            const paymentsClientA = await googlePayScriptLoader.getGooglePaymentsClient();
            const paymentsClientB = await googlePayScriptLoader.getGooglePaymentsClient();

            expect(paymentsClientA).toBe(paymentsClientB);
        });

        it('should fail to load the Google Pay API JavaScript library', async () => {
            jest.spyOn(scriptLoader, 'loadScript').mockImplementationOnce(() => {
                delete googlePayWindow.google;

                return Promise.resolve();
            });

            const paymentsClientPromise = googlePayScriptLoader.getGooglePaymentsClient();

            await expect(paymentsClientPromise).rejects.toThrow(
                PaymentMethodClientUnavailableError,
            );
        });
    });
});
