import RequestError from './request-error';

// Have to use `as` https://stackoverflow.com/questions/73987044/typeguarding-an-unknown-nested-object should be fixed in 4.8+
const isRequestError = (error: unknown): error is RequestError => {
    return typeof error === 'object' && error !== null && 'body' in error;
};

export default isRequestError;
