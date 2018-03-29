/// <reference path="./amazon-login.d.ts" />
/// <reference path="./off-amazon-payments.d.ts" />

import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import { getAmazonPay } from '../../../payment/payment-methods.mock';

import AmazonPayScriptLoader from './amazon-pay-script-loader';

describe('AmazonPayScriptLoader', () => {
    let amazonPayScriptLoader: AmazonPayScriptLoader;
    let hostWindow: amazon.HostWindow & OffAmazonPayments.HostWindow;
    let scriptLoader: ScriptLoader;
    let setClientIdSpy: jest.Mock;
    let setUseCookieSpy: jest.Mock;

    class Login implements amazon.Login {
        static setClientId(clientId: string): void {
            setClientIdSpy(clientId);
        }

        static setUseCookie(useCookie: boolean): void {
            setUseCookieSpy(useCookie);
        }
    }

    beforeEach(() => {
        scriptLoader = createScriptLoader();
        amazonPayScriptLoader = new AmazonPayScriptLoader(scriptLoader);
        setClientIdSpy = jest.fn();
        setUseCookieSpy = jest.fn();
        hostWindow = window;

        jest.spyOn(scriptLoader, 'loadScript')
            .mockImplementation(() => {
                hostWindow.amazon = { Login };

                Promise.resolve(new Event('load'));
            });
    });

    it('loads widget script', () => {
        const method = getAmazonPay();

        amazonPayScriptLoader.loadWidget(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            `https://static-na.payments-amazon.com/OffAmazonPayments/us/js/Widgets.js?sellerId=${method.config.merchantId}`
        );
    });

    it('loads widget script for different region', () => {
        const method = merge({}, getAmazonPay(), { initializationData: { region: 'EU' } });

        amazonPayScriptLoader.loadWidget(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            `https://static-eu.payments-amazon.com/OffAmazonPayments/eu/lpa/js/Widgets.js?sellerId=${method.config.merchantId}`
        );
    });

    it('loads sandbox widget script if in test mode', () => {
        const method = merge({}, getAmazonPay(), { config: { testMode: true } });

        amazonPayScriptLoader.loadWidget(method);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            `https://static-na.payments-amazon.com/OffAmazonPayments/us/sandbox/js/Widgets.js?sellerId=${method.config.merchantId}`
        );
    });

    it('configures widget SDK', () => {
        const method = getAmazonPay();

        amazonPayScriptLoader.loadWidget(method);

        expect(hostWindow.onAmazonLoginReady).not.toBeUndefined();

        hostWindow.onAmazonLoginReady();

        expect(setClientIdSpy).toHaveBeenCalledWith(method.initializationData.clientId);
        expect(setUseCookieSpy).toHaveBeenCalledWith(true);
    });

    it('overrides existing callbacks', () => {
        hostWindow.onAmazonPaymentsReady = jest.fn();

        const onReady = jest.fn();

        amazonPayScriptLoader.loadWidget(getAmazonPay(), onReady);

        expect(hostWindow.onAmazonPaymentsReady).toBe(onReady);
    });

    it('triggers payment callback directly if `OffAmazonPayments` module is already loaded', () => {
        const onReady = jest.fn();

        hostWindow.OffAmazonPayments = {};

        amazonPayScriptLoader.loadWidget(getAmazonPay(), onReady);

        expect(onReady).toHaveBeenCalled();
    });

    it('triggers login callback directly if `amazon` module is already loaded', () => {
        hostWindow.amazon = amazon;

        amazonPayScriptLoader.loadWidget(getAmazonPay());

        expect(setClientIdSpy).toHaveBeenCalled();
    });
});
