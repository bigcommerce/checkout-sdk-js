import RequestError from './request-error';

const isRequestError = (error: any): error is RequestError => {
    return (typeof error  === 'object' &&
    error !== null &&
    'body' in error &&
    typeof error.body === "object" && error.body !== null &&
    'errors' in error.body &&
    'provider_data' in error.body)
}

export default isRequestError;
