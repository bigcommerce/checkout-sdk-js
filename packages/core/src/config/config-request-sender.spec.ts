import { createRequestSender, createTimeout, Response } from '@bigcommerce/request-sender';

import { CheckoutNotAvailableError } from '../checkout/errors';
import { ContentType, INTERNAL_USE_ONLY, SDK_VERSION_HEADERS } from '../common/http-request';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

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

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));
        });

        it('loads config', async () => {
            const output = await configRequestSender.loadConfig();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/checkout-settings', {
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
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
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads config with checkout ID', async () => {
            const options = { params: { checkoutId: 'dummy' } };
            const output = await configRequestSender.loadConfig(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/checkout-settings', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    'X-API-INTERNAL': INTERNAL_USE_ONLY,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('throws a CheckoutNotAvailable error when it encounters a client error(400-499)', async () => {
            jest.spyOn(requestSender, 'get').mockRejectedValue(
                getErrorResponse(undefined, undefined, 404),
            );

            try {
                await configRequestSender.loadConfig();
            } catch (error) {
                expect(error).toBeInstanceOf(CheckoutNotAvailableError);
            }
        });

        it('throws a generic request error when it encounters a server error(500-599)', async () => {
            jest.spyOn(requestSender, 'get').mockRejectedValue(
                getErrorResponse(undefined, undefined, 500),
            );

            try {
                await configRequestSender.loadConfig();
            } catch (error) {
                expect(error).not.toBeInstanceOf(CheckoutNotAvailableError);
            }
        });
    });
});
