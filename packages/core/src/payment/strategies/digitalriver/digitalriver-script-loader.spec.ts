import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { DigitalRiverWindow } from './digitalriver';
import DigitalRiverScriptLoader from './digitalriver-script-loader';
import { getDigitalRiverJSMock } from './digitalriver.mock';

describe('DigitalRiverScriptLoader', () => {
    let digitalRiverScriptLoader: DigitalRiverScriptLoader;
    let scriptLoader: ScriptLoader;
    let stylesheetLoader: StylesheetLoader;
    let windowMock: DigitalRiverWindow;

    beforeEach(() => {
        windowMock = {} as DigitalRiverWindow;
        scriptLoader = {} as ScriptLoader;
        stylesheetLoader = {} as StylesheetLoader;
        digitalRiverScriptLoader = new DigitalRiverScriptLoader(
            scriptLoader,
            stylesheetLoader,
            windowMock,
        );
    });

    describe('#load()', () => {
        const digitalRiverJs = getDigitalRiverJSMock();
        const jsUrl = 'https://js.digitalriverws.com/v1/DigitalRiver.js';
        const cssUrl = 'https://js.digitalriverws.com/v1/css/DigitalRiver.css';

        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                windowMock.DigitalRiver = jest.fn(() => digitalRiverJs);

                return Promise.resolve();
            });

            stylesheetLoader.loadStylesheet = jest.fn(() => Promise.resolve());
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('loads the JS and CSS', async () => {
            await digitalRiverScriptLoader.load('pk_test1234', 'en-US');

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUrl);
            expect(stylesheetLoader.loadStylesheet).toHaveBeenCalledWith(cssUrl);
        });

        it('returns a DigitalRiverJS instance', async () => {
            expect(await digitalRiverScriptLoader.load('pk_test1234', 'en-US')).toBe(
                digitalRiverJs,
            );
        });

        it('returns a DigitalRiver undefined instance', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                windowMock.DigitalRiver = undefined;

                return Promise.resolve();
            });

            return expect(digitalRiverScriptLoader.load('pk_test1234', 'en-US')).rejects.toThrow(
                new PaymentMethodClientUnavailableError(),
            );
        });
    });
});
