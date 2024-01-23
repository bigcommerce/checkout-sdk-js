import { createCheckoutStore } from '../checkout';

import HostedFormFactory from './hosted-form-factory';
import HostedFormStoredCardService from './hosted-form-stored-card-service';

/**
 * Creates an instance of `HostedFormStoredCardService`.
 *
 *
 * @param host - Host url string parameter.
 * @returns An instance of `HostedFormStoredCardService`.
 */
export default function createHostedFormStoredCardService(host: string) {
    const store = createCheckoutStore();

    return new HostedFormStoredCardService(host, new HostedFormFactory(store));
}
