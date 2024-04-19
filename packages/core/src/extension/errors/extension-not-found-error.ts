import { StandardError } from '../../common/error/errors';

export class ExtensionNotFoundError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed due to no extension configured for this region.');

        this.name = 'ExtensionNotFoundError';
        this.type = 'extension_not_found';
    }
}
