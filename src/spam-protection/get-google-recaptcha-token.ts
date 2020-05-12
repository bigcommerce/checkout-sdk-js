
import { ReadableDataStore } from '@bigcommerce/data-store';

import { InternalCheckoutSelectors } from '../checkout';

import CardingProtectionActionCreator from './carding-protection-action-creator';

export default function getGoogleRecapthaToken(store: ReadableDataStore<InternalCheckoutSelectors>, error: any) {
    const { additional_action_required, status } = error;
    if (status === 'additional_action_required' && additional_action_required && additional_action_required.type === 'recaptcha_v2_verification') {
        const cardingProtectionActionCreator = new CardingProtectionActionCreator(additional_action_required.data.key);

        return cardingProtectionActionCreator.execute()(store).toPromise();
    }
    throw error;
}
