
import { handleContinueResponse, isContinueResponse } from './continue';
import { handleErrorResponse } from './error';
import { handleFailedResponse, isFailedResponse } from './failed';
import { handleSuccessResponse, isSuccessResponse } from './success';

/*
    This will likely need some local state
    for storing payment method data only available at time of instantiation
    so will probably need to become a class
*/

export const handler = async (response: Response): Promise<void> => {
    const { status, json } = response;

    if (status >= 300) {
        // ...handle API/network failures
    }

    const body = await json();

    if (isFailedResponse(body)) {
        // Could be the same handling needed in the status code branch above?
        return handleFailedResponse(body);
    }

    if (isSuccessResponse(body)) {
        return handleSuccessResponse(body);
    }

    if (isContinueResponse(body)) {
        /*
            Future considerations:

            our first continue response is a redirect
            which destroys our JS runtime

            However, all others won't

            As such they could be infinitely chained

            To handle this, our handleContinueResponse function will need
            to take a reference for the parent handler
            and be coded for recursion
            (possibly using observables?)
        */
        return handleContinueResponse(body);
    }

    // Else assume error?
    return handleErrorResponse(body);
};
