import { createAction } from '@bigcommerce/data-store';
import { concat, defer, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';

import { SignInEmailRequestBody } from './signin-email';
import { SendSignInEmailAction, SignInEmailActionType } from './signin-email-actions';
import SignInEmailRequestSender from './signin-email-request-sender';

export default class SignInEmailActionCreator {
    constructor(
        private _requestSender: SignInEmailRequestSender
    ) {}

    sendSignInEmail(
        emailRequest: SignInEmailRequestBody,
        options?: RequestOptions
    ): Observable<SendSignInEmailAction> {
        return concat(
            of(createAction(SignInEmailActionType.SendSignInEmailRequested)),
            defer(async () => {
                const { body } = await this._requestSender.sendSignInEmail(emailRequest, options);

                return createAction(SignInEmailActionType.SendSignInEmailSucceeded, body);
            })
        ).pipe(
            catchError(error => throwErrorAction(SignInEmailActionType.SendSignInEmailFailed, error))
        );
    }
}
