import { StandardError } from '../../common/error/errors';

export enum NotEmbeddableErrorType {
    MissingContainer = 'missing_container',
    MissingContent = 'missing_content',
    UnknownError = 'unknown_error',
}

/**
 * Throw this error if we are not able to embed the checkout form as an iframe.
 * This can be due to the fact that the provided container ID is invalid, or the
 * checkout form fails to load inside the iframe. It can also be due to an
 * unknown reason.
 */
export default class NotEmbeddableError extends StandardError {
    constructor(
        message?: string,
        public subtype: NotEmbeddableErrorType = NotEmbeddableErrorType.UnknownError
    ) {
        super(message || 'Unable to embed the checkout form.');

        this.name = 'NotEmbeddableError';
        this.type = 'not_embeddable';
    }
}
