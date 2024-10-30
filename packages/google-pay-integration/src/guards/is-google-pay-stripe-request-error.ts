interface AdditionalActionError {
    three_ds_result: { token: string };
    errors: Array<{ code: string }>;
}

const isGooglePayStripeRequestError = (body: unknown): body is AdditionalActionError => {
    return (
        typeof body === 'object' && body !== null && 'three_ds_result' in body && 'errors' in body
    );
};

export default isGooglePayStripeRequestError;
