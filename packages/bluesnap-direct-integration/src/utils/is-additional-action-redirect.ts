import { BlueSnapDirectIdealRedirectResponse } from '../types';

function isAdditionalActionRedirect(
    response: unknown,
): response is BlueSnapDirectIdealRedirectResponse {
    if (typeof response !== 'object' || response === null) {
        return false;
    }

    const partialResponse: Partial<BlueSnapDirectIdealRedirectResponse> = response;

    if (!partialResponse.body) {
        return false;
    }

    const partialBody: Partial<BlueSnapDirectIdealRedirectResponse['body']> = partialResponse.body;

    return (
        partialBody.status === 'additional_action_required' &&
        !!partialBody.additional_action_required?.data.redirect_url
    );
}

export default isAdditionalActionRedirect;
