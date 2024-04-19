import { StandardError } from '../../common/error/errors';

export class ExtensionNotLoadedError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to load an extension');

        this.name = 'ExtensionNotLoadedError';
        this.type = 'extension_not_loaded';
    }
}
