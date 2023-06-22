import {
    createRequestSender,
    createTimeout,
    RequestSender,
    Response,
} from '@bigcommerce/request-sender';

import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import { Extension } from './extension';
import { ExtensionRequestSender, EXTENSIONS_API_URL } from './extension-request-sender';
import { getExtensions } from './extension.mock';

describe('ExtensionRequestSender', () => {
    let extensionRequestSender: ExtensionRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        extensionRequestSender = new ExtensionRequestSender(requestSender);
    });

    describe('#loadExtensions()', () => {
        let response: Response<Extension[]>;

        beforeEach(() => {
            response = getResponse(getExtensions());

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));
        });

        it('loads extensions', async () => {
            expect(await extensionRequestSender.loadExtensions()).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith(EXTENSIONS_API_URL, {
                timeout: undefined,
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads extensions with timeout', async () => {
            const options = { timeout: createTimeout() };

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));

            expect(await extensionRequestSender.loadExtensions(options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith(EXTENSIONS_API_URL, {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });

        it('loads extensions with params', async () => {
            const options = { params: { method: 'method-id' } };

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));

            expect(await extensionRequestSender.loadExtensions(options)).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith(EXTENSIONS_API_URL, {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                    ...SDK_VERSION_HEADERS,
                },
            });
        });
    });
});
