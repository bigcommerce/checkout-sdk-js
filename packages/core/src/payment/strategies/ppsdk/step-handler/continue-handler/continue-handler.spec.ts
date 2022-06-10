import { createFormPoster } from '@bigcommerce/form-poster';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../../../spam-protection';

import { Continue, ContinueHandler } from './continue-handler';

describe('ContinueHandler', () => {
    const formPoster = createFormPoster();
    const continueHandler = new ContinueHandler(formPoster, new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())));

    describe('#handle', () => {
        it('passes redirect parameters to the redirect handler', () => {
            const assignSpy = jest.spyOn(location, 'assign').mockImplementation(jest.fn);

            const redirectContinueResponse: Continue = {
                type: 'continue',
                code: 'redirect',
                parameters: {
                    url: 'http://some-url.com',
                },
            };

            continueHandler.handle(redirectContinueResponse);

            expect(assignSpy).toHaveBeenCalledWith('http://some-url.com');
        });
    });
});
