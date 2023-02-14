import { Response } from '@bigcommerce/request-sender';

import { StorefrontErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getErrorResponse } from '../../http-request/responses.mock';

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
        expect(error.message).toBe('Coupon FOO cannot be applied');
    });

    it('creates an array of error objects', () => {
        expect(error.errors).toEqual([
            { code: 'min_purchase', message: 'Coupon FOO cannot be applied' },
        ]);
    });
});
