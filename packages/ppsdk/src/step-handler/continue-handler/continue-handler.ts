import { FormPoster } from '@bigcommerce/form-poster';
import { PaymentAdditionalAction } from "@bigcommerce/checkout-sdk/payment-integration-api";
import { overSome } from 'lodash';

import { PaymentHumanVerificationHandler } from "packages/core/src/spam-protection";

import { PaymentsAPIResponse } from '../../ppsdk-payments-api-response';

import { handleHumanVerification, isHumanVerification, HumanVerification } from './human-verification';
import { handleRedirect, isRedirect, Redirect } from './redirect';

export type Continue = Redirect | HumanVerification;

const isAnyContinue = overSome([isRedirect, isHumanVerification]);

export const isContinue = (body: PaymentsAPIResponse['body']): body is Continue => isAnyContinue(body);

export interface ContinueCallbacks {
    humanVerification?(additionalAction: PaymentAdditionalAction): Promise<void>;
}

export class ContinueHandler {
    constructor(
        private _formPoster: FormPoster,
        private _humanVerificationHandler: PaymentHumanVerificationHandler
    ) {}

    handle(body: Continue, callbacks?: ContinueCallbacks): Promise<void> {
        switch (body.code) {
            case 'redirect':
                return handleRedirect(body.parameters, this._formPoster);
            case 'resubmit_with_human_verification':
                return handleHumanVerification(body.parameters, this._humanVerificationHandler, callbacks?.humanVerification);
        }
    }
}
