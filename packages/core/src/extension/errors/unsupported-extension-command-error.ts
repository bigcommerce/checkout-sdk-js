import { StandardError } from '../../common/error/errors';

export class UnsupportedExtensionCommandError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed due to unsupported extension command.');

        this.name = 'UnsupportedExtensionCommandError';
        this.type = 'unsupported_extension_command_error';
    }
}
