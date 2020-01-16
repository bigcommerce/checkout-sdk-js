import { ScriptLoader } from '@bigcommerce/script-loader';

import GoogleRecaptchaScriptLoader, { GoogleRecaptchaWindow } from './google-recaptcha-script-loader';
import { getGoogleRecaptchaMock } from './google-recaptcha.mock';

describe('GoogleRecaptchaScriptLoader', () => {
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: GoogleRecaptchaWindow;

    beforeEach(() => {
        mockWindow = {} as GoogleRecaptchaWindow;
        scriptLoader = new ScriptLoader();
    });

    describe('#load()', () => {
        beforeEach(() => {
            jest.spyOn(scriptLoader, 'loadScript');
        });

        it('loads the script if the script is not already loaded', () => {
            googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(scriptLoader, mockWindow);
            googleRecaptchaScriptLoader.load();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//www.google.com/recaptcha/api.js?onload=initRecaptcha&render=explicit');
        });

        it('does not load the script if the script is already loaded', () => {
            googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(scriptLoader, mockWindow);

            googleRecaptchaScriptLoader.load();
            googleRecaptchaScriptLoader.load();

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });

        it('can be reloaded if load fails', async () => {
            jest.spyOn(scriptLoader, 'loadScript').mockRejectedValueOnce(new Error());

            googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(scriptLoader, mockWindow);

            try {
                await googleRecaptchaScriptLoader.load();
            } catch (error) {
                expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
                googleRecaptchaScriptLoader.load();
                expect(scriptLoader.loadScript).toHaveBeenCalledTimes(2);
            }
        });

        it('calls the callback after the script is loaded', () => {
            googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(scriptLoader, mockWindow);

            const loadPromise = googleRecaptchaScriptLoader.load();

            mockWindow.grecaptcha = getGoogleRecaptchaMock();
            // tslint:disable-next-line:no-non-null-assertion
            mockWindow.initRecaptcha!();

            expect(loadPromise).resolves.toEqual(mockWindow.grecaptcha);
        });
    });
});
