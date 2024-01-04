import { CreateTokenError } from './td-online-mart';

export default function isCreateTokenError(error: unknown): error is CreateTokenError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'field' in error &&
        'type' in error &&
        'message' in error
    );
}
