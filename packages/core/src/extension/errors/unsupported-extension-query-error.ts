import { StandardError } from '../../common/error/errors';

export class UnsupportedExtensionQueryError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed due to unsupported extension query.');

        this.name = 'UnsupportedExtensionQueryError';
        this.type = 'unsupported_extension_query_error';
    }
}
