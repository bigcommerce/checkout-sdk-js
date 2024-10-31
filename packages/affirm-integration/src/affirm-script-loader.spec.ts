import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Affirm, AffirmHostWindow } from './affirm';
import AffirmScriptLoader from './affirm-script-loader';
import { getAffirmScriptMock } from './affirm.mock';
import loadAffirmJS from './affirmJs';

jest.mock('./affirmJs');

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const affirmJsMock = loadAffirmJS as jest.Mock<void>;

describe('AffirmScriptLoader', () => {
    let affirmScriptLoader: AffirmScriptLoader;
    let affirmWindow: AffirmHostWindow;

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        affirmWindow = {} as AffirmHostWindow;
        affirmScriptLoader = new AffirmScriptLoader(affirmWindow);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#load()', () => {
        let affirmScript: Affirm;

        beforeEach(() => {
            affirmScript = getAffirmScriptMock(jest.fn());
            affirmJsMock.mockImplementation(() => {
                affirmWindow.affirm = affirmScript;
            });
        });

        it('loads the Script with testMode equals to false', async () => {
            await affirmScriptLoader.load('apiKeyTest', false);

            expect(loadAffirmJS).toHaveBeenCalledWith(
                'apiKeyTest',
                '//cdn1.affirm.com/js/v2/affirm.js',
            );
        });

        it('loads the Script with testMode equals to true', async () => {
            await affirmScriptLoader.load('apiKeyTest', true);

            expect(loadAffirmJS).toHaveBeenCalledWith(
                'apiKeyTest',
                '//cdn1-sandbox.affirm.com/js/v2/affirm.js',
            );
        });

        it('returns the Script from the window', async () => {
            expect(await affirmScriptLoader.load()).toBe(affirmScript);
        });

        it('throws error when window is not set', async () => {
            affirmJsMock.mockImplementation(() => {
                affirmWindow.affirm = undefined;
            });

            try {
                await affirmScriptLoader.load();
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(error).toBeInstanceOf(StandardError);
            }
        });
    });
});
