interface ErrorResponse {
    type: 'error';
    // type def here
}

export const isErrorResponse = (x: unknown): x is ErrorResponse => {
    // some type checking
    return true;
};

export const handleErrorResponse = (error?: ErrorResponse): Promise<void> => {
    // Further discern error types

    // Take any possible remedial action

    // Else map to checkout-sdk error codes

    // And throw?

    // Or reject promise?
    return Promise.reject();
};
