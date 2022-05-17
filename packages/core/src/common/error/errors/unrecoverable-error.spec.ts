import { getResponse } from '../../http-request/responses.mock';

import UnrecoverableError from './unrecoverable-error';

describe('UnrecoverableError', () => {
    it('returns error name', () => {
        const error = new UnrecoverableError(getResponse('Error'));

        expect(error.name).toEqual('UnrecoverableError');
    });
});
