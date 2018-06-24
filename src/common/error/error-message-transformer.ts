import { toSingleLine } from '../utility';

export default class ErrorMessageTransformer<TError extends Error = Error> {
    constructor(
        private _messageCustomizer: (type: TError) => string
    ) {}

    transform(error: TError): TError {
        error.message = toSingleLine(this._messageCustomizer(error));

        return error;
    }
}
