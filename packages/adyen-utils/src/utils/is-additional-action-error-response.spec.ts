import { getAdditionalActionError } from '../adyenv3/adyenv3.mock';
import { ResultCode } from '../types';

import isAdditionalActionRequiredErrorResponse from './is-additional-action-error-response';

describe('isAdditionalActionRequiredErrorResponse', () => {
    const challengeShopperErrorBody = getAdditionalActionError(ResultCode.ChallengeShopper).body;

    it('state is isAdditionalActionRequiredErrorResponse', () => {
        expect(isAdditionalActionRequiredErrorResponse(challengeShopperErrorBody)).toBe(true);
    });

    it('state is not isAdditionalActionRequiredErrorResponse', () => {
        expect(
            isAdditionalActionRequiredErrorResponse({
                ...challengeShopperErrorBody,
                errors: {},
            }),
        ).toBe(false);
    });
});
