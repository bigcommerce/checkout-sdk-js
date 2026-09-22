import { RequestError as CoreRequestError } from '../common/error/errors';

import { RequestError } from './checkout-sdk';

describe('checkout-sdk public exports', () => {
    it('exports RequestError as a runtime constructor', () => {
        expect(RequestError).toBe(CoreRequestError);
        expect(new RequestError().name).toBe('RequestError');
    });
});
