import HostedFormFactory from './hosted-form-factory';
import StoredCardHostedFormService from './stored-card-hosted-form-service';

/**
 * Creates an instance of `StoredCardHostedFormService`.
 *
 *
 * @param host - Host url string parameter.
 * @returns An instance of `StoredCardHostedFormService`.
 */
export default function createStoredCardHostedFormService(host: string) {
    return new StoredCardHostedFormService(host, new HostedFormFactory());
}
