import { ClearErrorAction, ErrorActionType } from './error-actions';

export default class ErrorActionCreator {
    clearError(error: Error): ClearErrorAction {
        return {
            type: ErrorActionType.ClearError,
            payload: error,
        };
    }
}
