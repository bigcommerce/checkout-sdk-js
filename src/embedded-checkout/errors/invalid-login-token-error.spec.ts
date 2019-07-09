import { getErrorResponse } from '../../common/http-request/responses.mock';

import InvalidLoginTokenError from './invalid-login-token-error';

describe('InvalidLoginTokenError', () => {
    it('returns error name', () => {
        const error = new InvalidLoginTokenError(getErrorResponse({
            status: 400,
            title: 'Invalid login token error',
            type: 'invalid_login',
            errors: ['Invalid details.'],
        }));

        expect(error.name).toEqual('InvalidLoginTokenError');
    });
});
