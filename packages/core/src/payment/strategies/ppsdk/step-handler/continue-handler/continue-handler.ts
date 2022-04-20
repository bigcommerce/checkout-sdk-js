import { FormPoster } from '@bigcommerce/form-poster';
import { overSome } from 'lodash';

import { PaymentsAPIResponse } from '../../ppsdk-payments-api-response';

import { handleRedirect, isRedirect, Redirect } from './redirect';

export type Continue = Redirect;

const isAnyContinue = overSome(isRedirect);

export const isContinue = (body: PaymentsAPIResponse['body']): body is Continue => isAnyContinue(body);

export class ContinueHandler {
    constructor(
        private _formPoster: FormPoster
    ) {}

    handle(body: Continue): Promise<void> {
        switch (body.code) {
            case 'redirect':
                return handleRedirect(body.parameters, this._formPoster);
            // TODO: Add a case for human verification handling
        }
    }
}
