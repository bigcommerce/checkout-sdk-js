import { StandardError } from '../../common/error/errors';

export enum NotEmbeddableErrorType {
    MissingContainer = 'missing_container',
    MissingContent = 'missing_content',
    UnknownError = 'unknown_error',
}

export default class NotEmbeddableError extends StandardError {
    constructor(
        message?: string,
        public subtype: NotEmbeddableErrorType = NotEmbeddableErrorType.UnknownError
    ) {
        super(message || 'Unable to embed the checkout form.');

        this.type = 'not_embeddable';
    }
}
