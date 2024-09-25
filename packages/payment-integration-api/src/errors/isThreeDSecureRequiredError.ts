import { some } from 'lodash';

import { isRequestError, RequestError } from './';

export default function isThreeDSecureRequiredError(error: unknown): error is RequestError {
    return isRequestError(error) && some(error.body.errors, { code: 'three_d_secure_required' });
}
