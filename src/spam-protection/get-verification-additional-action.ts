import { RequestError } from '../common/error/errors';
import { AdditionalAction } from '../payment';

import PaymentHumanVerificationHandler from './payment-human-verification-handler';

export default function getVerificationAdditionalAction(error: RequestError): Promise<AdditionalAction> {
    if (isPaymentHumanVerificationRequest(error)) {
        const paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(error.body.additional_action_required.data.key);

        return paymentHumanVerificationHandler.execute().toPromise();
    }
    throw error;
}

function isPaymentHumanVerificationRequest(error: RequestError): boolean {

    const { additional_action_required, status } = error.body;

    return status === 'additional_action_required'
        && additional_action_required
        && additional_action_required.type === 'recaptcha_v2_verification';
}
