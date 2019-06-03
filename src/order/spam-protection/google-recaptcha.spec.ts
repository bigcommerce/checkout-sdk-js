import { ScriptLoader } from '@bigcommerce/script-loader';

import GoogleRecaptcha from './google-recaptcha';
import GoogleRecaptchaScriptLoader, { GoogleRecaptchaWindow } from './google-recaptcha-script-loader';
import { getGoogleRecaptchaMock } from './google-recaptcha.mock';

describe('GoogleRecaptcha', () => {
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: GoogleRecaptchaWindow;

    beforeEach(() => {
        mockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        scriptLoader = new ScriptLoader();
        googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(scriptLoader, mockWindow);
        googleRecaptcha = new GoogleRecaptcha(googleRecaptchaScriptLoader);
    });

    describe('#render()', () => {
        let googleRecaptchaMock: ReCaptchaV2.ReCaptcha;

        beforeEach(() => {
            googleRecaptchaMock = getGoogleRecaptchaMock();
            googleRecaptchaMock.getResponse = jest.fn(() => 'google-recaptcha-token');
            googleRecaptchaMock.render = jest.fn((_containerId, { callback }) => callback());

            jest.spyOn(googleRecaptchaScriptLoader, 'load').mockResolvedValue(googleRecaptchaMock);
        });

        it('loads the google recaptcha script', async () => {
            const containerId = 'spamProtection';
            const sitekey = 'sitekey';
            const callbacks = {
                callback: () => jest.fn(),
            };

            await googleRecaptcha.render(containerId, sitekey, callbacks);

            expect(googleRecaptchaScriptLoader.load).toHaveBeenCalled();
        });

        it('returns a promise', async () => {
            const containerId = 'spamProtection';
            const sitekey = 'sitekey';
            const callbacks = {
                callback: () => jest.fn(),
            };

            await googleRecaptcha.render(containerId, sitekey, callbacks);

            expect(googleRecaptchaMock.render)
                .toBeCalledWith(containerId, {
                    sitekey,
                    callback: expect.any(Function),
                });
        });
    });
});
