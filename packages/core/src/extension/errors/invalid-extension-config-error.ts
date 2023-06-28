import { StandardError } from '../../common/error/errors';

export class InvalidExtensionConfigError extends StandardError {
    constructor(message?: string) {
        super(
            message || 'Unable to proceed due to invalid configuration provided for the extension.',
        );

        this.name = 'InvalidExtensionConfigError';
        this.type = 'invalid_extension_config';
    }
}
