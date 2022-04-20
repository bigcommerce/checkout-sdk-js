import { RequestError } from '../../../../common/error/errors';

import { handleUnsupported } from './unsupported';

describe('handleUnsupported', () => {
    it('rejects with RequestError', async () => {
        const unsupportedResponse = {
            body: {
                type: 'continue',
                code: 'not-supported',
            },
            status: 200,
            statusText: '',
            headers: [],
        };

        await expect(handleUnsupported(unsupportedResponse)).rejects.toBeInstanceOf(RequestError);
    });
});
