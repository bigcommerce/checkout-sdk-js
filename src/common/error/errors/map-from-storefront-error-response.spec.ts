import { Response } from '@bigcommerce/request-sender';

import { getErrorResponse } from '../../http-request/responses.mock';
import { StorefrontErrorResponseBody } from '../error-response-body';

import mapFromStorefrontErrorResponse from './map-from-storefront-error-response';
import RequestError from './request-error';

describe('mapFromStorefrontErrorResponse()', () => {
    let error: RequestError<StorefrontErrorResponseBody>;
    let response: Response<StorefrontErrorResponseBody>;

    beforeEach(() => {
        response = getErrorResponse({
            status: 400,
            title: 'Coupon cannot be applied',
            detail: 'Coupon FOO cannot be applied',
            type: 'about:blank',
            code: 'min_purchase',
        });

        error = mapFromStorefrontErrorResponse(response);
    });

    it('sets message using detail', () => {
        expect(error.message).toEqual('Coupon FOO cannot be applied');
    });

    it('creates an array of error objects', () => {
        expect(error.errors).toEqual([
            { code: 'min_purchase', message: 'Coupon FOO cannot be applied' },
        ]);
    });
});
