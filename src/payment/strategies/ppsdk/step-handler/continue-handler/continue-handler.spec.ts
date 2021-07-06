import { createFormPoster } from '@bigcommerce/form-poster';

import { Continue, ContinueHandler } from './continue-handler';
import * as redirectHandler from './redirect';

describe('ContinueHandler', () => {
    const formPoster = createFormPoster();
    const continueHandler = new ContinueHandler(formPoster);

    describe('#handle', () => {
        it('passes redirect parameters to the redirect handler', () => {
            const handleRedirect = jest.spyOn(redirectHandler, 'handleRedirect').mockImplementation(jest.fn);

            const redirectContinueResponse: Continue = {
                type: 'continue',
                code: 'redirect',
                parameters: {
                    url: 'http://some-url.com',
                },
            };

            continueHandler.handle(redirectContinueResponse);

            expect(handleRedirect).toHaveBeenCalledWith({ url: 'http://some-url.com' }, formPoster);
        });
    });
});
