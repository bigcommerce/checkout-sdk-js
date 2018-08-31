import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';

import { ContentType, INTERNAL_USE_ONLY } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import Config from './config';
import ConfigRequestSender from './config-request-sender';
import { getConfig } from './configs.mock';

describe('ConfigRequestSender', () => {
    const requestSender = createRequestSender();
    let configRequestSender: ConfigRequestSender;

    beforeEach(() => {
        configRequestSender = new ConfigRequestSender(requestSender);
    });

    describe('#loadConfig()', () => {
        let response: Response<Config>;

        beforeEach(() => {
            response = getResponse(getConfig());

            jest.spyOn(requestSender, 'get')
                .mockReturnValue(Promise.resolve(response));
        });

        it('loads config', async () => {
            const output = await configRequestSender.loadConfig();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/checkout-settings', {
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                },
            });
        });

        it('loads config with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await configRequestSender.loadConfig(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/checkout-settings', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                },
            });
        });
    });
});
