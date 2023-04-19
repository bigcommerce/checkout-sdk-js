import getThreeDSecureRequestError from '../mocks/google-pay-threedsecure-request-error.mock';

import { isGooglePayThreeDSecureResult } from './is-google-pay-threedsecure-result';

describe('isGooglePayThreeDSecureResult', () => {
    it('should be a GooglePayThreeDSecureResult', () => {
        const result = getThreeDSecureRequestError().body;

        expect(isGooglePayThreeDSecureResult(result)).toBe(true);
    });

    describe('should NOT be a GooglePayThreeDSecureResult if:', () => {
        test('undefined', () => {
            expect(isGooglePayThreeDSecureResult(undefined)).toBe(false);
        });

        test('null', () => {
            expect(isGooglePayThreeDSecureResult(null)).toBe(false);
        });

        test('empty', () => {
            expect(isGooglePayThreeDSecureResult({})).toBe(false);
        });

        test('three_ds_result.acs_url is not a string', () => {
            const result = {
                three_ds_result: {
                    code: 'three_d_secure_required',
                },
            };

            expect(isGooglePayThreeDSecureResult(result)).toBe(false);
        });

        test('three_ds_result.code is not a string', () => {
            const result = {
                three_ds_result: {
                    acs_url: 'https://foo.com',
                },
            };

            expect(isGooglePayThreeDSecureResult(result)).toBe(false);
        });
    });
});
