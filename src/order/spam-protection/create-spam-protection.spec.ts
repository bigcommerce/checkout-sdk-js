import { ScriptLoader } from '@bigcommerce/script-loader';

import createSpamProtection from './create-spam-protection';
import GoogleRecaptcha from './google-recaptcha';

describe('createSpamProtection()', () => {
    let spamProtection: GoogleRecaptcha;

    beforeEach(() => {
        spamProtection = createSpamProtection(new ScriptLoader());
    });

    it('returns an instance of Google Recaptcha', () => {
        expect(spamProtection).toBeInstanceOf(GoogleRecaptcha);
    });
});
