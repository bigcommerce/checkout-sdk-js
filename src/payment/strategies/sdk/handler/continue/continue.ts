import { handleRedirect, isRedirect, Redirect } from './redirect';

type ContinueResponse = Redirect /* | ContinueStepB | ContinueStepC */;

export const isContinueResponse = (x: unknown): x is ContinueResponse => {
    // some type checking
    return true;
};

export const handleContinueResponse = (continueResponse: ContinueResponse): Promise<void> => {
    // Further discern Continue sub-types

    if (isRedirect(continueResponse)) {
        return handleRedirect(continueResponse);
    }

    /*
        Future considerations:

        Some future continue steps may need to control things outside of this execution scope
        either still inside checkout-sdk's codebase
        or also outside in checkout-js's codebase

        currently checkout-sdk doesn't know checkout-js exists (orchestration runs the other way)

        for either scenario we're probably going to need some kind of pub/sub/eventing system
        (possibly using observables, at least in checkout-sdk)
    */

    // if continue step isn't found
    // log error BC side?
    // translate into checkout SDK error code?
    // throw or reject promise?
    return Promise.reject();
};
