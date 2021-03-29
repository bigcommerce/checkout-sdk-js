interface FailedResponse {
    type: 'failed';
    // type def here
}

export const isFailedResponse = (x: unknown): x is FailedResponse => {
    // some type checking
    return true;
};

export const handleFailedResponse = (failed: FailedResponse): Promise<void> => {
    // Further discern Failed sub-types

    // Take any possible remedial action

    // Else map to checkout-sdk Failed codes

    // And throw?

    // Or reject promise?
    return Promise.reject();
};
