import { AdyenAdditionalActionErrorResponse } from '../types';

export default function isAdditionalActionRequiredErrorResponse(
    param: unknown,
): param is AdyenAdditionalActionErrorResponse {
    return (
        typeof param === 'object' &&
        param !== null &&
        'errors' in (param as AdyenAdditionalActionErrorResponse) &&
        Array.isArray((param as AdyenAdditionalActionErrorResponse).errors) &&
        (param as AdyenAdditionalActionErrorResponse).errors.length > 0 &&
        'code' in (param as AdyenAdditionalActionErrorResponse).errors[0] &&
        typeof (param as AdyenAdditionalActionErrorResponse).errors[0].code === 'string' &&
        'provider_data' in param &&
        typeof (param as AdyenAdditionalActionErrorResponse).provider_data === 'object'
    );
}
