import { ReadableDataStore } from '@bigcommerce/data-store';

import { InternalCheckoutSelectors } from '../checkout';
import { RequestError } from '../common/error/errors';

import CardingProtectionActionCreator from './carding-protection-action-creator';

export default function getGoogleRecaptchaToken(store: ReadableDataStore<InternalCheckoutSelectors>, error: RequestError) {
    if (isRecaptchaVerificationRequest(error)) {
        const cardingProtectionActionCreator = new CardingProtectionActionCreator(error.body.additional_action_required.data.key);

        return cardingProtectionActionCreator.execute()(store).toPromise();
    }
    throw error;
}

function isRecaptchaVerificationRequest(error: RequestError) {

    const { additional_action_required, status } = error.body;

    return status === 'additional_action_required'
        && additional_action_required
        && additional_action_required.type === 'recaptcha_v2_verification';
}
