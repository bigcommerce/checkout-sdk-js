import { StandardError } from '../../common/error/errors';

export default class NotEmbeddableError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to embed the checkout form.');

        this.type = 'not_embeddable';
    }
}
