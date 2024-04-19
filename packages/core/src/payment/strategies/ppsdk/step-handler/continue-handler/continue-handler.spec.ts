import { createFormPoster } from '@bigcommerce/form-poster';
import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    createSpamProtection,
    PaymentHumanVerificationHandler,
} from '../../../../../spam-protection';

import { Continue, ContinueHandler } from './continue-handler';

describe('ContinueHandler', () => {
    const formPoster = createFormPoster();
    const continueHandler = new ContinueHandler(
        formPoster,
        new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
    );

    describe('#handle', () => {
        it('passes redirect parameters to the redirect handler', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    assign: jest.fn(),
                    href: 'foobar',
                },
            });

            const redirectContinueResponse: Continue = {
                type: 'continue',
                code: 'redirect',
                parameters: {
                    url: 'http://some-url.com',
                },
            };

            continueHandler.handle(redirectContinueResponse);

            expect(window.location.assign).toHaveBeenCalledWith('http://some-url.com');
        });
    });
});
