import { ScriptLoader } from '@bigcommerce/script-loader';

import { MutationObserverFactory } from '../../common/dom/mutation-observer';
import { NotInitializedError } from '../../common/error/errors';

import GoogleRecaptcha from './google-recaptcha';
import GoogleRecaptchaScriptLoader, { GoogleRecaptchaWindow } from './google-recaptcha-script-loader';
import { getGoogleRecaptchaMock } from './google-recaptcha.mock';

describe('GoogleRecaptcha', () => {
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: GoogleRecaptchaWindow;
    let mutationObserverFactory: MutationObserverFactory;

    beforeEach(() => {
        mockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        scriptLoader = new ScriptLoader();
        googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(scriptLoader, mockWindow);
        mutationObserverFactory = new MutationObserverFactory();
        googleRecaptcha = new GoogleRecaptcha(googleRecaptchaScriptLoader, mutationObserverFactory);
    });

    describe('#load()', () => {
        let googleRecaptchaMock: ReCaptchaV2.ReCaptcha;

        beforeEach(() => {
            googleRecaptchaMock = getGoogleRecaptchaMock();
            googleRecaptchaMock.getResponse = jest.fn(() => 'google-recaptcha-token');
            googleRecaptchaMock.render = jest.fn((_containerId, { callback }) => callback());

            jest.spyOn(googleRecaptchaScriptLoader, 'load')
                .mockResolvedValue(googleRecaptchaMock);
        });

        it('loads the google recaptcha script', async () => {
            const containerId = 'spamProtection';
            const sitekey = 'sitekey';

            await googleRecaptcha.load(containerId, sitekey);

            expect(googleRecaptchaScriptLoader.load).toHaveBeenCalled();
        });

        it('returns a promise', async () => {
            const containerId = 'spamProtection';
            const sitekey = 'sitekey';
            const size = 'invisible';

            await googleRecaptcha.load(containerId, sitekey);

            expect(googleRecaptchaMock.render)
                .toBeCalledWith(containerId, {
                    sitekey,
                    size,
                    callback: expect.any(Function),
                    'error-callback': expect.any(Function),
                });
        });
    });

    describe('#execute()', () => {
        let googleRecaptchaMock: ReCaptchaV2.ReCaptcha;

        beforeEach(() => {
            jest.spyOn(mutationObserverFactory, 'create')
                .mockReturnValue({
                    disconect: jest.fn(),
                    observe: jest.fn(),
                    takeRecords: jest.fn(),
                });

            googleRecaptchaMock = getGoogleRecaptchaMock();

            googleRecaptchaMock.render = jest.fn((_containerId, { callback }) => callback());

            jest.spyOn(googleRecaptchaScriptLoader, 'load')
                .mockResolvedValue(googleRecaptchaMock);
        });

        it('throws an error if google recaptcha is not initialized', () => {
            expect(() => googleRecaptcha.execute()).toThrow(NotInitializedError);
        });

        it('execute google recaptcha', async () => {
            const containerId = 'spamProtection';
            const sitekey = 'sitekey';

            const recaptchaChallengeContainer = new DOMParser().parseFromString(
                '<div style="visibility: hidden"><div><iframe title="recaptcha challenge"></div></div>',
                'text/html'
            ).body;

            document.body.appendChild(recaptchaChallengeContainer);

            await googleRecaptcha.load(containerId, sitekey);

            googleRecaptcha.execute();

            await new Promise(resolve => process.nextTick(resolve));

            expect(googleRecaptchaMock.getResponse).toHaveBeenCalled();
            expect(googleRecaptchaMock.reset).toHaveBeenCalled();
            expect(googleRecaptchaMock.execute).toHaveBeenCalled();
        });
    });
});
