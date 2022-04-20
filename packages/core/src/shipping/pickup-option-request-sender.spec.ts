import { createRequestSender, RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import { PickupOptionResponse } from './pickup-option';
import PickupOptionRequestSender from './pickup-option-request-sender';
import { getApiQueryForPickupOptions, getPickupOptionsResponseBody } from './pickup-option.mock';

describe('PickupOptionRequestSender', () => {
    let pickupOptionRequestSender: PickupOptionRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        pickupOptionRequestSender = new PickupOptionRequestSender(requestSender);
    });

    describe('#fetchPickupOptions', () => {
        let response: Response<PickupOptionResponse>;

        beforeEach(() => {
            response = getResponse(getPickupOptionsResponseBody());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));
        });

        it('fetches pickup options', async () => {
            const query = getApiQueryForPickupOptions();
            const output = await pickupOptionRequestSender.fetchPickupOptions(query);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/pickup-options', {
                headers: { Accept: ContentType.Json, ...SDK_VERSION_HEADERS },
                body: query,
            });
        });
    });
});
